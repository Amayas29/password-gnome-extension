const FILE = "database.json";
const GNOMESHELL = "gnome-shell/extensions/passwordmanager@Amayas29.github.com";
const GLib = imports.gi.GLib;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;

const dataDir = Utils.joinPaths([GLib.get_user_data_dir(), GNOMESHELL, FILE]);
let passwords = [];

class Password {
  constructor(service, username, password) {
    this.service = service;
    this.username = username;
    this.password = password;
  }

  static addPassword(password) {
    for (const p of passwords) if (p.service === password.service) return;

    passwords.push(password);
  }

  static getPassword(service) {
    for (const p of passwords) if (p.service === service) return p;

    return null;
  }

  static load() {
    if (Utils.fileExists(dataDir)) {
      let data = Utils.readFromFile(dataDir);
      if (data === null || data.length === 0) {
        passwords = [];
        return;
      }
      let content = JSON.parse(data);
      passwords = content;
      return;
    }

    passwords = [];
  }

  static write() {
    Utils.writeToFile(dataDir, JSON.stringify(passwords));
  }
}
