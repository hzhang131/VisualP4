/* Before you come here and yell me at these global constants... I know these are not good. 
   But I don't feel the need to change anything for now. */

/******************************** JS Metadata *****************************/
let height = 0;
let global_editor = [null];
let global_editor_values = [null];
let current_input = null;
let current_selected_window = 0;
let fileCount = 0;
let global_node_dict = [];
let global_flow_editor = null;
let global_slider = null;
let display_code = true;
let display_headers_page = false;
/* This thing is Javascript's equivalent of a defaultdict. */
let highest_node_sequence = new Proxy(
  {},
  {
    get: (target, name) => (name in target ? target[name] : 0),
  }
);

let ACTION_STYLE_OVERRIDE = [
  "width: 300px;",
  "min-height: 100px;",
  "border-radius: 10px;",
  "background: #DB3A34; align-items: baseline;",
];
let STATE_STYLE_OVERRIDE = [
  "width: 300px;",
  "min-height: 100px;",
  "border-radius: 10px;",
  "background: #DDCAD9; align-items: baseline;",
];
let TABLE_STYLE_OVERRIDE = [
  "width: 300px;",
  "min-height: 100px;",
  "border-radius: 10px;",
  "background: #6A5B6E; align-items: baseline;",
];
let STYLE_OVERRIDE = {
  action: ACTION_STYLE_OVERRIDE,
  state: STATE_STYLE_OVERRIDE,
  table: TABLE_STYLE_OVERRIDE,
};
var INIT_HEADER_PAGE_DATA = {};
let ACTION_HTMLCONTENT_FIELDS = function (node_id) {
  return `<div class = "module-element">
                                    <p style="justify-content: center; float:left; margin: auto;"> Action </p>
                                    <p style="justify-content: center; float:left; margin: auto;"> <input id = "action-input-field" placeholder="Action name" style="font-family:Courier, monospace; background: transparent;"> </input> </p>
                                    <p style="justify-content: center; float:right; margin: auto;"> 
                                        <button class="btn" onclick="addModuleStatements('${node_id}', 'action')"> 
                                            <i class="fa-sharp fa-solid fa-circle-plus fa-lg" style="color: #1f2551;"></i> 
                                        </button> 
                                    </p>
                                </div>`;
};
let STATE_HTMLCONTENT_FIELDS = function (node_id) {
  return `<div class = "module-element">
                                    <p style="justify-content: center; float:left; margin: auto;"> State </p>
                                    <p style="justify-content: center; float:left; margin: auto;"> <input id = "state-input-field" placeholder="State name" style="font-family:Courier, monospace; background: transparent;"> </input> </p>
                                    <p style="justify-content: center; float:right; margin: auto;"> 
                                        <button class="btn" onclick="addModuleStatements('${node_id}', 'state')"> 
                                            <i class="fa-sharp fa-solid fa-circle-plus fa-lg" style="color: #1f2551;"></i> 
                                        </button> 
                                    </p>
                                </div>`;
};
let TABLE_HTMLCONTENT_FIELDS = function (node_id) {
  return `<div class = "module-element">
                                    <p style="justify-content: center; float:left; margin: auto;"> Table </p>
                                    <p style="justify-content: center; float:left; margin: auto;"> <input id = "table-input-field" placeholder="Table name" style="font-family:Courier, monospace; background: transparent;"> </input> </p>
                                    <p style="justify-content: center; float:right; margin: auto;"> 
                                        <button class="btn" onclick="addModuleStatements('${node_id}', 'table')"> 
                                            <i class="fa-sharp fa-solid fa-circle-plus fa-lg" style="color: #1f2551;"></i> 
                                        </button> 
                                    </p>
                                </div>`;
};
let HTMLCONTENT_FIELDS = {
  action: ACTION_HTMLCONTENT_FIELDS,
  state: STATE_HTMLCONTENT_FIELDS,
  table: TABLE_HTMLCONTENT_FIELDS,
};

let ACTION_STATEMENT = function (node_id, sequence_id) {
  return `<p style="margin: auto; justify-content: center; float:left;"> You got me hahaha</p>`;
};

let STATE_STATEMENT = function (node_id, sequence_id) {
  return `<div class="dropdown-container">
                                        <div class="dropdown" id = "category-${node_id}-${sequence_id}">
                                            <button class="dropdown-item">Menu &#9662;</button>
                                            <div class="dropdown-content">
                                                <button class="dropdown-content-item" onclick="dropdownContentItemHandler('${node_id}', '${sequence_id}', 'category', 'Extract')">Extract</button>
                                                <button class="dropdown-content-item" onclick="dropdownContentItemHandler('${node_id}', '${sequence_id}', 'category', 'Drop')">Drop</button>
                                            </div>               
                                        </div>
                                        <div class="dropdown" id = "target-${node_id}-${sequence_id}">
                                            <button class="dropdown-item">Target &#9662;</button>
                                            <div class="dropdown-content">
                                                <button class="dropdown-content-item" onclick="dropdownContentItemHandler('${node_id}', '${sequence_id}', 'target', 'hdr.ethernet')">hdr.ethernet</button>
                                                <button class="dropdown-content-item" onclick="dropdownContentItemHandler('${node_id}', '${sequence_id}', 'target', 'hdr.ipv4')">hdr.ipv4</button>
                                            </div>               
                                        </div>
                                        <button class="btn" onclick="dropdownDivRemove('${node_id}', '${sequence_id}')"> 
                                            <i class="fa-sharp fa-solid fa-times-circle fa-lg" style="color: #1f2551;"></i> 
                                        </button> 
                                    </div>`;
};

let TABLE_STATEMENT = function (node_id, sequence_id) {
  return `<p style="margin: auto; justify-content: center; float:left;"> You got me hahaha</p>`;
};

let STATEMENTS = {
  action: ACTION_STATEMENT,
  state: STATE_STATEMENT,
  table: TABLE_STATEMENT,
};

let INJECT_FUNCS = {
  "vars": InjectVars,
  "typedefs": InjectTypedefs,
  "structs": InjectStructs,
  "headers": InjectHeaders,
};

/******************************** Main Logic and functions *****************************/
window.addEventListener("DOMContentLoaded", function () {
  //This section loads up the code editor(s).
  var codeTextArea = document.getElementById("code");
  height = window.innerHeight;
  var minLines = Math.trunc((height * 0.8) / 15) + 3;
  var startingValue = "/**\nWelcome to the VisualP4 IDE!\n**/";
  for (var i = 0; i < minLines; i++) {
    startingValue += "\n";
  }

  var editor = CodeMirror.fromTextArea(codeTextArea, {
    lineNumbers: true,
    tabSize: 2,
  });

  editor.setValue(startingValue);
  global_editor[current_selected_window] = editor;

  // This part initializes the flowchart canvas.
  var example = document.getElementById("drawflow");
  global_flow_editor = new Drawflow(example);
  global_flow_editor.start();

  // This part initializes the slider input.
  global_slider = document.getElementById("myRange");
  global_slider.addEventListener("input", zoomLevelAdjust);
  global_editor.zoom_max = 100;
  global_editor.zoom_min = 0;
  global_editor.zoom_value = 1;

  //Drawflow objects take a higher z-index than none drawflow objects.
  main_drawflow = document.querySelector("div.drawflow");
  main_drawflow.style.zIndex = 4;
  main_drawflow.style.height = 96 + "%";
  // I don't really know how to fix this, but here is a hardcoded height value
  // so that main_drawflow doesn't cover everything else we want.
  HeaderPageData();
});

function reportWindowSize() {
  if (height != window.innerHeight) {
    if (global_editor[current_selected_window]) {
      string = global_editor[current_selected_window].getValue().split("\n");
      string = string.slice(1);
      string = string.join("");
      set = new Set(string);
      if (string.size == 1) {
        var minLines = Math.trunc((window.innerHeight * 0.8) / 15) + 3;
        var startingValue = "/**\nWelcome to the VisualP4 IDE!\n**/";
        for (var i = 0; i < minLines; i++) {
          startingValue += "\n";
        }
        global_editor[current_selected_window].setValue(startingValue);
      }
    }
    height = window.innerHeight;
  }
}

function captureCode() {
  if (global_editor[current_selected_window]) {
    if (
      global_editor_values[current_selected_window] !=
      global_editor[current_selected_window].getValue()
    ) {
      global_editor_values[current_selected_window] =
        global_editor[current_selected_window].getValue();
    }
  }
}

function createFileTabs() {
  const buttonList = document.querySelector(".buttons");

  buttonList.innerHTML += `<button id="file-${fileCount}"> file-${fileCount} </li>`;

  const buttonListItem = document.getElementById(`file-${fileCount}`);

  buttonListItem.classList.add("button");

  // add attributes
  buttonListItem.setAttribute("id", `file-${fileCount}`);

  // add events
  buttonListItem.addEventListener("click", () => {
    alert("You clicked on something!");
  });
}

function createNewModule() {
  /* This function creates a new module and dump that module to a less cluttered area. */
  /* editor.addNode(name, inputs, outputs, posx, posy, class, data, html); */

  var html = `<p style="text-align:center; font-family:Courier, monospace;">Right click to select type</p>`;
  global_flow_editor.addNode("New Node", 1, 1, 100, 300, "generic", {}, html);
  /* If there is no more room to put stuff in the new workspace, then we have to move it to another view */
}

function zoomLevelAdjust() {
  global_flow_editor.zoom = global_slider.value;
  global_flow_editor.zoom_refresh();
  UpdateConditionBoxLocation(global_flow_editor.zoom);
}

function changeModuleType(node_id, type) {
  matches = document.getElementById(node_id);
  var class_name = matches.getAttribute("class");
  myArray = class_name.split(" ");
  myArray[1] = type;
  matches.setAttribute("class", myArray.join(" "));
  /* Change style also */
  var style_string = matches.getAttribute("style");
  myArray = style_string.split(";");
  /* Keeps the positional data unchanged. */
  myArray = myArray.slice(0, 2);
  myArray = myArray.concat(STYLE_OVERRIDE[type]);
  matches.setAttribute("style", myArray.join(";"));
  /* Initialize content fields for each module type */
  console.log(matches.childNodes[1]);
  matches.childNodes[1].innerHTML = HTMLCONTENT_FIELDS[type](node_id);
  /* Change drawflow-content-node to flex and flex-direction: column for better visuability. */
  matches.childNodes[1].setAttribute(
    "style",
    "display: flex; flex-direction: column;"
  );
}

function addModuleStatements(node_id, type) {
  switch (type) {
    case "action":
      addActionModuleStatements(node_id);
      break;
    case "state":
      addStateModuleStatements(node_id);
      break;
    case "table":
      addTableModuleStatements(node_id);
      break;
    default:
      console.log("Reachable only if the html script is spoofed.");
      break;
  }
}

function removeModuleStatements(node_id, type) {
  switch (type) {
    case "action":
      removeActionModuleStatements(node_id);
      break;
    case "state":
      addActionModuleStatements(node_id);
      break;
    case "table":
      addActionModuleStatements(node_id);
      break;
    default:
      console.log("Reachable only if the html script is spoofed.");
      break;
  }
}

function dropdownContentItemHandler(node_id, sequence_id, type, arg) {
  console.log(node_id, sequence_id, type, arg);
  // Update the button display.
  dropdown_button_info = document.getElementById(
    `${type}-${node_id}-${sequence_id}`
  );
  // Match statement id here.
  lala = dropdown_button_info.querySelector(".dropdown .dropdown-item");
  lala.innerHTML = arg;
  // TODO: Every onclick requires updating data in a persistant data storage.
}

function dropdownContentItemConnectionHandler(id, category, arg) {
  // Place an id here.
  var query_id = id.replaceAll(" ", "-");
  var query_class_name = id.replaceAll(" ", ".");
  var toplevel_drawflow = document.querySelector(".parent-drawflow");
  console.log(query_id);
  console.log(
    toplevel_drawflow.querySelectorAll(`div.side-by-side-div-${query_id}`)
      .length
  );

  /* Since I know the id of the thing, I can try grab the location data from it. */
  connection_box = document.querySelector(`svg.${query_class_name}`);
  path_box = connection_box.querySelector("path.main-path");
  /* Increase the z-index of the paths so that the paths always take priority. */
  connection_box.z_index = 0.5;
  path_pos_data = path_box.getBoundingClientRect();
  if (
    !toplevel_drawflow.querySelectorAll(`div.side-by-side-div-${query_id}`)
      .length
  ) {
    /* Create display box if not exists */
    var outerdiv = document.createElement("div");
    outerdiv.classList.add(`side-by-side-div-${query_id}`);

    var div1 = document.createElement("div");
    var div2 = document.createElement("div");
    var div3 = document.createElement("div");
    var div4 = document.createElement("div");

    div1.classList.add(`side-by-side-div-${query_id}-switch-head`);
    div2.classList.add(`side-by-side-div-${query_id}-switch-target`);
    div3.classList.add("side-by-side-div-field3");
    div4.classList.add("side-by-side-div-field4");
    subdivs = [div1, div2, div3, div4];

    outerdiv.appendChild(div1);
    outerdiv.appendChild(div2);
    outerdiv.appendChild(div3);
    outerdiv.appendChild(div4);

    // Some style parameters. I know I am not allowed to do it here, but come on!
    outerdiv.style.backgroundColor = "lightblue";
    outerdiv.style.opacity = 0.5;
    outerdiv.style.border = "1px solid black";
    outerdiv.style.width = "auto";
    outerdiv.style.height = "auto";
    outerdiv.style.display = "inline-flex";
    outerdiv.style.fontFamily = "Courier New";
    outerdiv.style.position = "absolute";

    outerdiv.style.top = top + "px";
    outerdiv.style.left = left + "px";
    toplevel_drawflow.appendChild(outerdiv);
  }

  /* Update display content.*/
  current_side_by_side = toplevel_drawflow.querySelector(
    `div.side-by-side-div-${query_id}`
  );
  category_level_div = current_side_by_side.querySelector(
    `div.side-by-side-div-${query_id}-${category}`
  );
  if (category_level_div) {
    category_level_div.innerHTML = `<p>${arg}&nbsp;</p>`;
  }

  var centerX = path_pos_data.left + path_pos_data.width / 2; // Calculate the x-coordinate of the center
  var centerY = path_pos_data.top + path_pos_data.height / 2; // Calculate the y-coordinate of the center

  var width = current_side_by_side.offsetWidth;
  var height = current_side_by_side.offsetHeight;

  var left = centerX - width / 2; // Calculate the left position
  var top = centerY - height / 2; // Calculate the top position
  current_side_by_side.style.top = top + "px";
  current_side_by_side.style.left = left + "px";
  current_side_by_side.style.zIndex = 1;

  // Scale everything by zoom level.
  UpdateConditionBoxLocation(global_flow_editor.zoom);
  /* On change, we also need to update new position in drawflow.js */
  // TODO: Every onclick requires updating data in a persistant data storage.
}

function dropdownDivRemove(node_id, sequence_id) {
  // Get an element from the div stack and remove it from the div stack.
  const element_to_remove = document.getElementById(
    `statement-${node_id}-${sequence_id}`
  );
  element_to_remove.remove();
  // TODO: Every onclick requires updating data in a persistant data storage.
}

function CodeDisplaySetting() {
  // User Toggle to enable / disable the code block.
  // Disabling: hides code block and expands the width of main canvas.
  // Enabling: shows code block and shrinks the width of main canvas.
  if (display_code) {
    document.querySelector(".code-block-div").style.display = "none";
    document.getElementById("drawflow").style.width = "100%";
  } else {
    document.querySelector(".code-block-div").style.display = "block";
    document.getElementById("drawflow").style.width = "70%";
  }
  display_code = !display_code;
}
function HeaderDisplaySetting() {
  const headersPage = document.querySelector(".headers-page");
  // User can toggle a headers page with this
  if (display_headers_page) {
    headersPage.classList.add("show");
  } else {
    headersPage.classList.remove("show");
  }
  display_headers_page = !display_headers_page;
}

function HeaderPageData() {
  // Reads the initial header data stored in './HPD/'
  const directoryPath = "./HPD/";
  fetch(directoryPath)
    .then((response) => response.text())
    .then((fileList) => {
      const files = fileList.split("\n");
      console.log(files);
      files.forEach((file) => {
        if (file.includes(".json")) {
          const regex = /<a[^>]+>([^<]+)<\/a>/;
          const match = file.match(regex);
          const filePath = directoryPath + match[1];
          fetch(filePath)
            .then((response) => response.json())
            .then((jsonData) => {
              // Use the JSON data from the file
              console.log(match[1].slice(0, -5));
              INJECT_FUNCS[match[1].slice(0, -5)](
                document.querySelector(
                  `.headers-page-item#${match[1].slice(0, -5)}`
                ),
                jsonData
              );
            })
            .catch((error) => {
              console.error("Error reading file:", error);
            });
        }
      });
    })
    .catch((error) => {
      console.error("Error reading directory:", error);
    });
}

function InjectVars(html_block, vars) {
  var tempHTML = "";
  for (let i = 0; i < vars.length; i++) {
    var item = vars[i];
    
    if (item.const){
      tempHTML += `
      <div class="data-container">
        <div class="data-name">${item.name}</div>
        <div class="data-item">
          <span style = "color: #DC3545">const</span>
          <span style = "color: #007BFF">${item.type} </span>
          <span>${item.value}</span>
        </div>
      </div>
    `;
    } else {
      tempHTML += `
      <div class="data-container">
        <div class="data-name">${item.name}</div>
        <div class="data-item">
          <span style = "color: #007BFF">${item.type} </span>
          <span>${item.value}</span>
        </div>
      </div>
    `;
    }
  }
  
  html_block.innerHTML = tempHTML;
}

function InjectHeaders(html_block, headers) {
  var tempHTML = "";
  for (let i = 0; i < headers.length; i++) {
    var item = headers[i];
  
    tempHTML += `
      <div class="data-container">
        <div class="data-name">${item.name}</div>
        ${generateFieldsHTML(item.fields)}
      </div>
    `;
  }
  
  html_block.innerHTML = tempHTML;
  
  function generateFieldsHTML(fields) {
    var fieldsHTML = '';
    for (let i = 0; i < fields.length; i++) {
      var field = fields[i];
      fieldsHTML += `
        <div class="data-item">
          <span style = "color: #007BFF">${field.type}</span>
          <span>${field.name}</span>
        </div>
      `;
    }
    return fieldsHTML;
  }  
}

function InjectStructs(html_block, structs) {
  tempHTML = "";
  for (let i = 0; i < structs.length; i++) {
    var item = structs[i];
  
    tempHTML += `
      <div class="data-container">
        <div class="data-name">${item.name}</div>
        ${generateContentHTML(item.content)}
      </div>
    `;
  }
  
  html_block.innerHTML = tempHTML;
  
  function generateContentHTML(content) {
    var contentHTML = "";
    for (let i = 0; i < content.length; i++) {
      var subItem = content[i];
      contentHTML += `
          <div class="data-item">
            <span style = "color: #007BFF">${subItem.type}</span>
            <span>${subItem.name}</span>
          </div>
      `;
    }
    return contentHTML;
  }
}

function InjectTypedefs(html_block, typedefs) {
  var tempHTML = "";
  for (let i = 0; i < typedefs.length; i++) {
    var elem = typedefs[i];
    tempHTML += `
    <div class="data-container" onclick="showDetails(this)">
      <div class="data-name">${elem.name}</div>
      <div class="data-item">
        <span style = "color: #007BFF">bit<${elem.bit}></span>
      </div>
    </div>
  `;
  } 
  html_block.innerHTML = tempHTML;
}

/* Exactly the same one as the one in drawflow.js. 
   This function should be able to be cross-imported, but I don't know how :( */
function UpdateConditionBoxLocation(zoom_level) {
  var side_by_side_divs = document.querySelectorAll(
    'div[class^="side-by-side-div"]'
  );
  var current_index = 0;
  for (
    current_index = 0;
    current_index < side_by_side_divs.length;
    current_index++
  ) {
    var child_divs_keyword_list = ["target", "head", "field3", "field4"];
    var child_div_classname = side_by_side_divs[current_index].className;
    var child_div_classname_chunks = child_div_classname.split("-");

    if (
      !child_divs_keyword_list.includes(
        child_div_classname_chunks[child_div_classname_chunks.length - 1]
      )
    ) {
      // This indicates that this block is the block that we are looking for.
      // Get id, grab path, and update location.
      // slice name to match svg class.

      var svg_elements = document.querySelectorAll(`svg[class^="connection"]`);
      var svg_index = -1;
      for (svg_index = 0; svg_index < svg_elements.length; svg_index++) {
        if (
          svg_elements[svg_index].className.baseVal.replaceAll(" ", "-") ==
          child_div_classname_chunks.slice(4).join("-")
        ) {
          // Found the svg element that we want to take information from... Break from the loop.
          break;
        }
      }

      var path_box = svg_elements[svg_index].querySelector("path.main-path");
      var path_pos_data = path_box.getBoundingClientRect();

      var centerX = path_pos_data.left + path_pos_data.width / 2; // Calculate the x-coordinate of the center
      var centerY = path_pos_data.top + path_pos_data.height / 2; // Calculate the y-coordinate of the center

      var width = side_by_side_divs[current_index].offsetWidth;
      var height = side_by_side_divs[current_index].offsetHeight;

      console.log(width, height, centerX, centerY);
      var left = centerX - width / 2; // Calculate the left position
      var top = centerY - height / 2; // Calculate the top position
      side_by_side_divs[current_index].style.top = top + "px";
      side_by_side_divs[current_index].style.left = left + "px";
      if (zoom_level) {
        side_by_side_divs[current_index].style.transform =
          "scale(" + zoom_level + ")";
      }
    }
  }
}

window.addEventListener("resize", reportWindowSize);
window.addEventListener("keydown", captureCode);

/***********************************Misc functions****************************/
function addActionModuleStatements(node_id) {
  console.log("line 207");
}
function addStateModuleStatements(node_id) {
  /***Get number of current statements ***/
  matches = document.getElementById(node_id);
  node_display_content = matches.childNodes[1];
  node_display_items = node_display_content.childNodes;
  console.log(node_display_items);
  node_index_array = Array.from(node_display_items, (node) => node.className);
  // Create a new div element
  const newDiv = document.createElement("div");
  newDiv.classList.add("module-element");
  newDiv.setAttribute(
    "id",
    `statement-${node_id}-${highest_node_sequence[node_id]}`
  );
  newDiv.innerHTML =
    STATEMENTS["state"](node_id, highest_node_sequence[node_id]) + "<br>";
  /* increments node_sequence to prevent collisions. */
  highest_node_sequence[node_id] += 1;
  /* Append the new div as a child of the parent div. */
  node_display_content.appendChild(newDiv);
}

function addTableModuleStatements(node_id) {
  console.log("line 213");
}
function removeActionModuleStatements(node_id) {
  console.log("To be implemented later!");
}
function removeStateModuleStatements(node_id) {
  console.log("To be implemented later!");
}
function removeTableModuleStatements(node_id) {
  console.log("To be implemented later!");
}

// Hover.
if (document.querySelector("body > p:hover") != null) {
  console.log("hovered");
}
