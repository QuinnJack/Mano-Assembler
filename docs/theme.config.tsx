import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  logo: (
    <>
      Mano Machine
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
  primaryHue: {
    light: 38,
    dark: 35
  }};

export default config;
