import { EventEmitter, Uri } from "vscode";

class DocumentationProvider {
  private readonly _uri: Uri;
  private readonly _emitter: EventEmitter<Uri>;
  private _documentationContent: string[];

  get value() {
    return this._documentationContent.join("\n");
  }

  constructor(uri: Uri, emitter: EventEmitter<Uri>) {
    this._uri = uri;
    // The DocumentationProvider has access to the event emitter from
    // the containing provider. This allows it to signal changes
    this._emitter = emitter;
    this._documentationContent = ["# Loading documentation"];
    // Start with printing an temporary message while we fecth the documentation
    this._fetchDocumentation();
  }
  pauseForThreeSeconds(rule?: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (rule === "updateDoc") {
          this._documentationContent.push("FAKE PLACEHOLDER DOCUMENT");
        }
        resolve();
      }, 3000);
    });
  }

  private async _fetchDocumentation() {
    // Temporarilly faking asynchronous operation
    await this.pauseForThreeSeconds("updateDoc");
    this._emitter.fire(this._uri);
  }
}
export default DocumentationProvider;
