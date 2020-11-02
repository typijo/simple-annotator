import React from "react";
import "bulma/css/bulma.css";

class FileSelector extends React.Component {
    constructor() {
        super();
        
        this.file = null;
    };

    handleFile = async () => {
        if (!this.file || !this.file.files || !this.file.files[0]) {
            return;
        }
        let filename = this.file.files[0].name;
        this.props.onSubmit(this.file.files[0], filename);
    };

    render() {
        return (
            <div className="file has-name">
                <label className="file-label">
                    <input
                        className="file-input"
                        type="file"
                        name="resume"
                        ref={(file) => {
                            this.file = file;
                        }}
                        onChange={this.handleFile}
                    />
                    <span className="file-cta">
                        <span className="file-icon">
                            <i className="fas fa-upload"></i>
                        </span>
                        <span className="file-label">
                            {this.props.inst}
                        </span>
                    </span>
                    <span className="file-name">
                        {this.props.filename}
                    </span>
                </label>
            </div>
        );
    };
};

export default FileSelector;