const { St } = imports.gi;
const PopupMenu = imports.ui.popupMenu;

class MenuItem {
  constructor(items) {
    this.container = MenuItem.getItemMenu();
    this.items = items;

    if (items !== null)
      for (const item of items) {
        this.container.add_child(item);
      }
  }

  static getItemMenu() {
    return new PopupMenu.PopupMenuItem(null, {
      reactive: false,
    });
  }

  static getButtonItem(label, style_class, clicked_fct) {
    let button = new St.Button({
      label: label,
      style_class: style_class,
      can_focus: true,
      track_hover: true,
    });

    if (clicked_fct !== null) button.connect("clicked", clicked_fct);
    return button;
  }

  static getEntryItem(name, hint_text, style_class, password = false) {
    if (password)
      return new St.PasswordEntry({
        name: name,
        hint_text: _(hint_text),
        can_focus: true,
        track_hover: true,
        style_class: style_class,
      });

    return new St.Entry({
      name: name,
      hint_text: _(hint_text),
      can_focus: true,
      track_hover: true,
      style_class: style_class,
    });
  }

  static getLabel(style_class, text) {
    return new St.Label({
      style_class: style_class,
      text: text,
    });
  }
}
