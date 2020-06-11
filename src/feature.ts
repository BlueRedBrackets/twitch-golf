import { ExtensionContext } from "vscode";

export default interface IFeature {
    installOn(context: ExtensionContext): void
}