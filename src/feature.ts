import { ExtensionContext } from "vscode";

export interface IFeature {
    installOn(context: ExtensionContext): void
}