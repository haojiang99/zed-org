{ pkgs ? import <nixpkgs> { config = { allowUnfree = true; }; } }:

with pkgs; mkShell {
  name = "zed-org";

  buildInputs = [
    nodejs_20
  ];
}
