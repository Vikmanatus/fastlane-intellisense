import { EventEmitter, MarkdownString, Uri } from "vscode";
import { fetchFastlaneDoc, parseFastlaneDoc } from "../helpers";

class DocumentationProvider {
  private readonly _uri: Uri;
  private readonly _emitter: EventEmitter<Uri>;
  private readonly _actionName: string;
  private _documentationContent: string[];

  get value() {
    return this._documentationContent.join("\n");
  }

  constructor(uri: Uri, emitter: EventEmitter<Uri>, actionName: string) {
    this._uri = uri;
    // The DocumentationProvider has access to the event emitter from
    // the containing provider. This allows it to signal changes
    this._emitter = emitter;
    this._documentationContent = ["# Loading documentation"];
    this._actionName = actionName;
    // Start with printing an temporary message while we fecth the documentation
    this._fetchDocumentation();
  }
  private createMarkdownElement(content:string): MarkdownString{
    const contents = new MarkdownString(content);
    contents.isTrusted = true;
    contents.supportHtml = true;
    return contents;
  }
  private async _fetchDocumentation() {
    // Temporarilly faking asynchronous operation
    fetchFastlaneDoc(this._actionName)
      .then((result) => parseFastlaneDoc(result))
      .then((result) => {
        this._documentationContent.shift();
        const contents = this.createMarkdownElement(result);
        this._documentationContent.push(contents.value);
        this._documentationContent.push(
          "**Note**: This document has been scrapped from the official fastlane documentation"
        );
        this._emitter.fire(this._uri);
      })
      .catch((_err) => {
        this._documentationContent.shift();
        const contents = this.createMarkdownElement("An internal error has occured.");
        this._documentationContent.push(contents.value);
        this._emitter.fire(this._uri);
      });
  }
}
export default DocumentationProvider;
