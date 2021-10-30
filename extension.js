/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

const GETTEXT_DOMAIN = "password-manager";

const { GObject, St, Gio } = imports.gi;

const Gettext = imports.gettext.domain(GETTEXT_DOMAIN);
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

const Me = ExtensionUtils.getCurrentExtension();
const MenuItem = Me.imports.menuItem.MenuItem;
const cipher = Me.imports.encrypt.cipher;
const decipher = Me.imports.encrypt.decipher;
const Password = Me.imports.passwords.Password;

let enc = cipher("qwdbNID])]l4BnU8t1j9pPNo!(JHwjCB");
let dec = decipher("qwdbNID])]l4BnU8t1j9pPNo!(JHwjCB");
let menu;
let backButton = MenuItem.getButtonItem(_("Back"), "button", null);

let saveItems, getItems, generateItems;
const LENGTH = 32;
const dataLowerCase = "azertyuiopqsdfghjklmwxcvbn";
const dataUpperCase = dataLowerCase.toUpperCase();
const dataNumbers = "0123456789";
const dataOthers = "!?@$)([]";

let data = [];

data.push(...dataLowerCase);
data.push(...dataUpperCase);
data.push(...dataNumbers);
data.push(...dataOthers);

let back = () => {
  menu.removeAll();

  backButton = MenuItem.getButtonItem(_("Back"), "button", null);
  backButton.connect("clicked", back);

  initialMenu();
};

let save = () => {
  let service = saveItems.serviceItem.items[0].get_text();
  let username = saveItems.usernameItem.items[0].get_text();
  let password = saveItems.passwordItem.items[0].get_text();

  if (service === "" || username === "" || password === "") return;

  let pass = new Password(service, username, enc(password));
  Password.addPassword(pass);
  Password.write();
};

let get = () => {
  let service = getItems.serviceItem.items[0].get_text();

  let password = Password.getPassword(service);

  let userLabel = getItems.usernameItem.items[0];
  userLabel.visible = false;
  let user = getItems.usernameItem.items[1];
  user.visible = false;

  let passLabel = getItems.passwordItem.items[0];
  passLabel.visible = false;
  let pass = getItems.passwordItem.items[1];
  pass.visible = false;

  if (password === null) return;

  userLabel.visible = true;
  user.visible = true;
  user.set_text(password.username);

  passLabel.visible = true;
  pass.visible = true;
  pass.set_text(dec(password.password));
};

let generate = () => {
  let password = "";

  for (let i = 0; i < LENGTH; i++)
    password += data[Math.floor(Math.random() * data.length)];

  generateItems.serviceItem.items[0].set_text(password);
};

let buildMenu = (fct_items) => {
  let items = fct_items();
  for (const key in items) {
    menu.addMenuItem(items[key].container);
  }
};

const saveMenuItems = () => {
  saveItems = {
    serviceItem: new MenuItem([
      MenuItem.getEntryItem(
        "serviceEntry",
        _("The Service name"),
        "item-input"
      ),
    ]),

    usernameItem: new MenuItem([
      MenuItem.getEntryItem("usernameEntry", _("Your Username"), "item-input"),
    ]),

    passwordItem: new MenuItem([
      MenuItem.getEntryItem(
        "passwordEntry",
        _("Your Password"),
        "item-input",
        true
      ),
    ]),

    buttons: new MenuItem([
      backButton,
      MenuItem.getButtonItem(_("Save"), "button", save),
    ]),
  };

  return saveItems;
};

const getMenuItems = () => {
  let passLabel = MenuItem.getLabel("label", _("Password"));
  passLabel.visible = false;
  let pass = MenuItem.getEntryItem(
    "passwordEntry",
    _("The password"),
    "item-input"
  );
  pass.visible = false;

  let userLabel = MenuItem.getLabel("label", _("Username"));
  userLabel.visible = false;
  let user = MenuItem.getEntryItem(
    "userEntry",
    _("The username"),
    "item-input"
  );
  user.visible = false;

  getItems = {
    serviceItem: new MenuItem([
      MenuItem.getEntryItem(
        "serviceEntry",
        _("The Service name"),
        "item-input"
      ),
    ]),

    usernameItem: new MenuItem([userLabel, user]),
    passwordItem: new MenuItem([passLabel, pass]),

    buttons: new MenuItem([
      backButton,
      MenuItem.getButtonItem(_("Get"), "button", get),
    ]),
  };

  return getItems;
};

const initialMenuItems = () => {
  return {
    buttons: new MenuItem([
      MenuItem.getButtonItem(_("Get"), "button", () => {
        menu.removeAll();
        getMenu();
      }),
      MenuItem.getButtonItem(_("Save"), "button", () => {
        menu.removeAll();
        saveMenu();
      }),
      MenuItem.getButtonItem(_("Generate"), "button", () => {
        menu.removeAll();
        generateMenu();
      }),
    ]),
  };
};

const generateMenuItems = () => {
  generateItems = {
    serviceItem: new MenuItem([
      MenuItem.getEntryItem(
        "passwordGenEntry",
        _("generated password"),
        "item-input"
      ),
    ]),

    buttons: new MenuItem([
      backButton,
      MenuItem.getButtonItem(_("Generate"), "button", generate),
    ]),
  };

  return generateItems;
};

let initialMenu = () => {
  buildMenu(initialMenuItems);
};

let saveMenu = () => {
  buildMenu(saveMenuItems);
};

let getMenu = () => {
  buildMenu(getMenuItems);
};

let generateMenu = () => {
  buildMenu(generateMenuItems);
};

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {
    _init() {
      super._init(0.0, _("Password Manager"));

      let box = new St.BoxLayout({ style_class: "panel-status-menu-box" });

      box.add_child(
        new St.Icon({
          gicon: Gio.icon_new_for_string(Me.dir.get_path() + "/icon.svg"),
          style_class: "system-status-icon",
        })
      );

      backButton.connect("clicked", () => back());

      this.add_actor(box);
      menu = this.menu;

      initialMenu();
    }
  }
);

class Extension {
  constructor(uuid) {
    this._uuid = uuid;

    ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
  }

  enable() {
    this._indicator = new Indicator();
    Main.panel.addToStatusArea(this._uuid, this._indicator);
  }

  disable() {
    this._indicator.destroy();
    this._indicator = null;
  }
}

function init(meta) {
  Password.load();
  return new Extension(meta.uuid);
}
