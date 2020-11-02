import React, { Component } from 'react';
import './App.css';

import { ToastProvider } from "react-toast-notifications";

import FileSelector from "./components/FileSelector";
import Editor from "./components/Editor";
import SelectedText from "./components/SelectedText";
import Saver from "./components/Saver";

import {makeDocumentInfoFromFile, readFileAsText} from "./helpers/filereader";
import {DocumentInfo, SelectedTextInfo} from "./helpers/documentinfo";
import { Schema, KEYCODES_SHORTCUT } from "./helpers/consts";

class Action {
  constructor(action, lid, targets) {
    this.action = action;
    this.lid = lid;
    this.targets = targets;
  };

  getInverted = () => {
    return new Action(!this.action, this.lid, this.targets);
  };
}
Action.ADD = true;
Action.REMOVE = false;

class App extends Component {
  state = {
    document: new DocumentInfo(),
    selectedText: new SelectedTextInfo(),
    dllink: "#",
    filename: "No file",
    schemaname: "Default",

    hist: [],
    histpointer: 0
  };

  handleFile = async (file, filename) => {
    try {
      const document = await makeDocumentInfoFromFile(file);

      this.setState({document, filename, hist: [], histpointer: 0});
    } catch (error) {
      alert(error);
    }
  };

  handleSchemaFile = async (file, filename) => {
    try {
      const schema = JSON.parse(await readFileAsText(file));
      Schema.setSchema(schema);

      this.setState({schemaname: filename});
    } catch (error) {
      alert(error);
    }
  };

  handleSelectedText = (text) => {
    this.setState({selectedText: text});
  };

  addAction = (action, lid, targets) => {
    const newhist = this.state.hist.slice(this.state.histpointer);
    newhist.unshift(new Action(action, lid, targets));

    this.setState({histpointer: 0, hist: newhist});
  };

  handleOnDeleteAnnotation = () => {
    const document = this.state.document;
    const textinfo = this.state.selectedText;
    
    const removed = document.removeAnnotations(
      textinfo.lid, textinfo.from, textinfo.to
    );

    if (removed) this.addAction(Action.REMOVE, textinfo.lid, removed);
    this.setState({document: document});
  }

  handleOnAddAnnotation = (annotype) => {
    const document = this.state.document;
    const textinfo = this.state.selectedText;
    
    const anno = document.addAnnotation(
      textinfo.lid, textinfo.from, textinfo.to, annotype
    );

    if (anno) this.addAction(Action.ADD, textinfo.lid, [anno]);
    this.setState({document: document, selectedText: new SelectedTextInfo()});
  }

  handleOnSave = () => {
    let outputData = this.state.document.toString();
    
    let blob = new Blob([outputData], { "type": "application/json"});
    this.setState({dllink: window.URL.createObjectURL(blob)});
  };

  handleSelection = (code) => {
    const tag = Schema.IndexedAnnotag[code];
    if (tag) this.handleOnAddAnnotation(tag);
  };

  handleKey = (e) => {
    const KEYCODE_TENKEY_0 = 96;
    const KEYCODE_Z = 90;
    const KEYCODE_X = 88;
    const KEYCODE_BS = 8;

    const keycode = e.keyCode;

    if (KEYCODES_SHORTCUT.indexOf(keycode) >= 0) {
      this.handleSelection(KEYCODES_SHORTCUT.indexOf(keycode));
    } else if (KEYCODE_TENKEY_0 < keycode && keycode <= KEYCODE_TENKEY_0 + 9) {
      this.handleSelection(keycode - KEYCODE_TENKEY_0 - 1);
    } else if (keycode === KEYCODE_Z) {
      this.handleUndo();
    } else if (keycode === KEYCODE_X) {
      this.handleRedo();
    } else if (keycode === KEYCODE_BS) {
      this.handleOnDeleteAnnotation();
    }
  };

  handleUndo = () => {
    let hpnow = this.state.histpointer;
    if (this.state.hist.length > hpnow) { // has more undos
      this.repeatAction(this.state.hist[hpnow].getInverted());
      this.setState({histpointer: hpnow+1});
    }
  };

  handleRedo = () => {
    let hpnow = this.state.histpointer;
    if (hpnow > 0) { // has more redos
      hpnow--; // rewind hist pointer
      this.repeatAction(this.state.hist[hpnow]);
      this.setState({histpointer: hpnow});
    }
  };

  repeatAction = (action) => {
    switch (action.action) {
      case Action.ADD:
        for (let target of action.targets) {
          this.state.document.addAnnotation(
            action.lid, target.from, target.to, target.annotype
          );
        }
        this.setState({document: this.state.document});

        break;
      
      case Action.REMOVE:
        for (let target of action.targets) {
          this.state.document.removeAnnotations(
            action.lid, target.from, target.to
          ); 
        }
        this.setState({document: this.state.document});

        break;
      
      default:
        console.warn("default reached, why")
    }
  };


  render() {
    return (
      <div className="App">
        <section className="hero is-primary">
          <div className="hero-body">
            <p className="title">Annotator</p>
          </div>
        </section>
        <section className="section">
          <div className="columns">
            <div className="column is-two-thirds">
              <div className="columns is-gapless">
                <div className="column">
                  <FileSelector 
                    onSubmit={this.handleFile}
                    inst="ファイルを開く"
                    filename={this.state.filename}
                  />
                  <FileSelector 
                    onSubmit={this.handleSchemaFile}
                    inst="スキーマを開く"
                    filename={this.state.schemaname}
                  />
                </div>
                <div className="column">
                  <Saver
                    onSave={this.handleOnSave}
                    filename={this.state.filename}
                    dllink={this.state.dllink}
                  />
                </div>
                <div className="column">
                  <button
                      className="button"
                      onClick={this.handleUndo}>
                      元に戻す (z)
                  </button>
                  <button
                      className="button"
                      onClick={this.handleRedo}>
                      繰り返し (x)
                  </button>
                </div>
              </div>
            </div>
            <div className="column is-one-third">
              <ToastProvider autoDismiss autoDismissTimeout={3000}>
                <SelectedText
                  textinfo={this.state.selectedText}
                  onDelete={this.handleOnDeleteAnnotation}
                  onAdd={this.handleOnAddAnnotation}
                />
              </ToastProvider>
            </div>
          </div>
          <ToastProvider autoDismiss autoDismissTimeout={3000}>
            <Editor 
              document={this.state.document}
              onTextSelected={this.handleSelectedText}
              onKeyDown={this.handleKey}
            />
          </ToastProvider>
        </section>
      </div>
    );
  }
}

export default App;
