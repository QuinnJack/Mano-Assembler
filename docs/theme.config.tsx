import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  logo: (
    <>
      {" "}
      <img
        src="https://see.fontimg.com/api/renderfont4/E447g/eyJyIjoiZHciLCJoIjoxMzAsInciOjIwMDAsImZzIjo2NSwiZmdjIjoiIzAwMDAwMCIsImJnYyI6IiNGRkZGRkYifQ/TWFubyBNYWNoaW5l/public-pixel.png"
        width="200px"
        height="200px"
      />
    </>
  ),
  project: {
    link: "https://github.com/QuinnJack/Mano-Assembler",
  },
  chat: {
    link: "https://github.com/QuinnJack/Mano-Assembler",
    icon: <></>,
  },
  docsRepositoryBase: "https://github.com/QuinnJack/Mano-Assembler/docs",
  footer: {
    text: "Created by Quinn Jackson",
  },
};

export default config;
