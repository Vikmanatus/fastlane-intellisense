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

    // The ReferencesDocument has access to the event emitter from
    // the containing provider. This allows it to signal changes
    this._emitter = emitter;
    console.log("INISDE DocumentationProvider constructor");

    // this._documentationContent.push("# Loading action documentation");
    console.log("after pushing update to array");
    this._documentationContent = ["# Loading documentation"];
    // Start with printing a header and start resolving
    this._populate();
  }
  pauseForThreeSeconds(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 5000);
    });
  }

  private async _populate() {
    //  await this.pauseForThreeSeconds();
    // this._documentationContent.push("# Loading action documentation");
    console.log("inisde populate");
    this._emitter.fire(this._uri);
  }
}
export default DocumentationProvider;
