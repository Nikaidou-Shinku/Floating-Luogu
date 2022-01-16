import $ from "jquery";
import React from "react";
import { render } from "react-dom";
import { Hello } from "./components";

// FIXME: delete before publishing
const homeContainer = $(".lg-index-content");
if (typeof homeContainer !== "undefined") {
  const helloDiv = $("<div />");
  homeContainer.prepend(helloDiv);
  render(<Hello />, helloDiv[0]);
}
