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

let menu;
let backButton = MenuItem.getButtonItem(_("Back"), "button", null);

let saveItems, getItems;

let back = () => {
  log("back");
  menu.removeAll();

  backButton = MenuItem.getButtonItem(_("Back"), "button", null);
  backButton.connect("clicked", back);

  initialMenu();
};

let save = () => {
  log("save");

  let service = saveItems.serviceItem.items[0].get_text();
  let username = saveItems.usernameItem.items[0].get_text();
  let password = saveItems.passwordItem.items[0].get_text();
};

let get = () => {
  log("get");

  let service = getItems.serviceItem.items[0].get_text();
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
  getItems = {
    serviceItem: new MenuItem([
      MenuItem.getEntryItem(
        "serviceEntry",
        _("The Service name"),
        "item-input"
      ),
    ]),

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
    ]),
  };
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
  return new Extension(meta.uuid);
}
