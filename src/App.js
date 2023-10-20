// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from "react";
import { ThemeProvider } from "./theme";
import styled from "styled-components";

import ChatContainer from "./components/Chat/ChatContainer";

import defaultTheme from './theme/defaultTheme';


const Page = styled.div`

  width: ${props => props.chatWidth ? props.chatWidth : "25vw"};
  height: ${props => props.chatHeight ? props.chatHeight : "75vh"};
  /*font-family: ${props => props.theme.fonts.regular};*/

  @font-face {
    font-family: "Foco W01 Regular";
    src: url("https://db.onlinewebfonts.com/t/f7ebd328a44ccedc268ddb6178e3d7eb.eot");
    src: url("https://db.onlinewebfonts.com/t/f7ebd328a44ccedc268ddb6178e3d7eb.eot?#iefix")format("embedded-opentype"),
    url("https://db.onlinewebfonts.com/t/f7ebd328a44ccedc268ddb6178e3d7eb.woff2")format("woff2"),
    url("https://db.onlinewebfonts.com/t/f7ebd328a44ccedc268ddb6178e3d7eb.woff")format("woff"),
    url("https://db.onlinewebfonts.com/t/f7ebd328a44ccedc268ddb6178e3d7eb.ttf")format("truetype"),
    url("https://db.onlinewebfonts.com/t/f7ebd328a44ccedc268ddb6178e3d7eb.svg#Foco W01 Regular")format("svg");
  }

  font-family: "Foco W01 Regular";
  font-size: 14px;

  margin: ${props => props.theme.spacing.base};
  border-collapse: collapse;
  box-shadow: 0px 2px 3px ${props => props.theme.palette.alto};

  box-sizing: border-box;

  *, *:before, *:after {
    box-sizing: inherit;
  }

  overflow: hidden;
  border-radius: 5px;
`;


const AppProvider = props => {
  return (
    <ThemeProvider theme={Object.assign({}, defaultTheme, props.themeConfig)}>
      {props.children}
    </ThemeProvider>
  );
};

App.defaultProps = {
  baseCssClass: "connect-customer-interface"
};

function App({ baseCssClass, ...props }) {
  return (
    <AppProvider themeConfig={props.themeConfig || {}}>
      <Page className={baseCssClass} chatWidth={props.chatWidth} chatHeight={props.chatHeight}>
        <ChatContainer {...props}/>
      </Page>
    </AppProvider>
  );
}

export default App;
