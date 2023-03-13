import { EventEmitter, Uri } from "vscode";

class DocumentationProvider {
  private readonly _uri: Uri;
  private readonly _emitter: EventEmitter<Uri>;
  private _documentationContent: string;

  get value() {
    return this._documentationContent;
  }

  constructor(uri: Uri, emitter: EventEmitter<Uri>) {
    this._uri = uri;

    // The ReferencesDocument has access to the event emitter from
    // the containing provider. This allows it to signal changes
    this._emitter = emitter;
    this._documentationContent = "";
    // Start with printing a header and start resolving
    this._populate();
  }

  private async _populate() {
    // await this._fetchAndFormatLocations(uri, ranges);
    this._documentationContent = "# Loading action documentation";
    this._emitter.fire(this._uri);
  }
}
export default DocumentationProvider;
