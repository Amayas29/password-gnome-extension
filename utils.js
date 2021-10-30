const ByteArray = imports.byteArray;
const GLib = imports.gi.GLib;

function fileExists(path) {
  return GLib.file_test(path, GLib.FileTest.EXISTS);
}

function writeToFile(path, content) {
  GLib.file_set_contents(path, content);
}

function readFromFile(path) {
  return GLib.file_get_contents(path)[1];
}

function joinPaths(paths) {
  return paths.join("/");
}
