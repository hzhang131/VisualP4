/* Before you come here and yell me at these global constants... I know these are not good. 
   But I don't feel the need to change anything for now. */

/******************************** JS Metadata *****************************/
let height = 0;
let global_editor = [null];
let global_editor_values = [null];
let global_init_header_page_data = null;
let current_input = null;
let current_selected_window = 0;
let fileCount = 0;
let global_node_dict = [];
let global_flow_editor = null;
let global_slider = null;
let display_code = false;
let display_headers_page = false;
let types = ["vars", "structs", "typedefs", "headers"];
window.header_name_dict = [];
/* This thing is Javascript's equivalent of a defaultdict. */
let highest_node_sequence = new Proxy(
  {},
  {
    get: (target, name) => (name in target ? target[name] : 0),
  }
);

let highest_headers_page_variable_sequence = 0;
let highest_subfield_sequence_under_headers_page_variables = new Proxy(
  {},
  {
    get: (target, name) => (name in target ? target[name] : 0),
  }
);

let ACTION_STYLE_OVERRIDE = [
  "min-width: 400px;",
  "min-height: 100px;",
  "border-radius: 10px;",
  "background: #DB3A34; align-items: baseline;"
];
let STATE_STYLE_OVERRIDE = [
  "min-width: 400px;",
  "min-height: 100px;",
  "border-radius: 10px;",
  "background: #DDCAD9; align-items: baseline;"
];
let TABLE_STYLE_OVERRIDE = [
  "min-width: 400px;",
  "min-height: 100px;",
  "border-radius: 10px;",
  "background: #6A5B6E; align-items: baseline;"
];
let STYLE_OVERRIDE = {
  action: ACTION_STYLE_OVERRIDE,
  state: STATE_STYLE_OVERRIDE,
  table: TABLE_STYLE_OVERRIDE,
};
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

let state_extraction_targets = null;
let state_condition_targets = null;
let raw_condition_html = null;

/******************************** Main Logic and functions *****************************/
window.addEventListener("DOMContentLoaded", function () {
  //This section loads up the code editor(s).
  let INIT_HEADER_PAGE_DATA = {};
  INIT_HEADER_PAGE_DATA["ABC"] = "abc";
  console.log(INIT_HEADER_PAGE_DATA);
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
  HeaderPageData(INIT_HEADER_PAGE_DATA)
    .then((INIT_HEADER_PAGE_DATA) => {
      console.log("INIT_HEADER_PAGE_DATA object:", INIT_HEADER_PAGE_DATA);
      // Call other functions passing INIT_HEADER_PAGE_DATA as needed
      state_extraction_targets = inferStateExtractionTarget(INIT_HEADER_PAGE_DATA);
      state_condition_targets = inferStateConditionTarget(INIT_HEADER_PAGE_DATA);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
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

function HeaderPageData(INIT_HEADER_PAGE_DATA) {
  // Reads the initial header data stored in './HPD/'
  const directoryPath = "./HPD/";
  var INIT_HEADER_PAGE_DATA = {};

  return new Promise((resolve, reject) => {
    fetch(directoryPath)
      .then((response) => response.text())
      .then((fileList) => {
        console.log(fileList);
        const files = JSON.parse(fileList)["files"];
        for (let i = 0; i < files.length; i++) {
          var file_name = Object.keys(files[i])[0];
          var raw_json = files[i][file_name];
          var jsonData = JSON.parse(raw_json);
          INJECT_FUNCS[file_name.slice(0, -5)](
            document.querySelector(`.headers-page-item#${file_name.slice(0, -5)}`),
            jsonData
          );
          INIT_HEADER_PAGE_DATA[file_name.slice(0, -5)] = jsonData;
          console.log("JSON data stored in INIT_HEADER_PAGE_DATA:", file_name.slice(0, -5));
        }
      })
      .then(() => {
        resolve(INIT_HEADER_PAGE_DATA);
        global_init_header_page_data = INIT_HEADER_PAGE_DATA;
        for (let index in types) {
          var type = types[index];
          for (let doc in global_init_header_page_data[type]) {
            var name = global_init_header_page_data[type][doc]["name"];
            window.header_name_dict[name] = doc;
          }
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 *           Cache these things, might be useful later.
 *           <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('delete', '')"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;"></i> </button>
 *           <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('modify', '')"> <i class="fa-solid fa-pen fa-lg" style="color: #1f2551;"></i> </button>
 */
function InjectVars(html_block, vars) {
  var tempHTML = `<div style="position: relative; top: 0; left: 0; width: 100%; height: 40px; background-color: transparent; margin-bottom: 10px; border-radius: 5px;">
                      <span style="position: absolute; top: 15px; left: 8px; z-index: 15"><i class="fa-solid fa-magnifying-glass fa-lg" style="color: #1f2551;"></i></span>
                      <input type="text" style="position: absolute; top: 0; left: 0; width: 200px; height: 40px; border-radius: 5px; padding: 0px; padding-right: 45px;">
                      <div class="add-icon" onclick="addHeaderPageItem('vars')">Add New Variables</div>
                  </div>`;
  for (let i = 0; i < vars.length; i++) {
    var item = vars[i];
    if (item.const) {
      tempHTML += `
      <div class="data-container" id = "${highest_headers_page_variable_sequence}">
        <div class="data-name">
            ${item.name}
            <button class="btn" style="float:right; padding:0px; margin-right: 0px; top: -3px; position: relative;" onclick="changeDataContainerState('delete', '${highest_headers_page_variable_sequence}', 'vars', '${item.name}')"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;"></i> </button>
            <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('add', '${highest_headers_page_variable_sequence}', 'vars')"> <i class="fa-solid fa-circle-plus  fa-lg" style="color: #1f2551;"></i> </button>
            <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('edit', '${highest_headers_page_variable_sequence}', 'vars')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
        </div>
        <div class="data-item" id = "${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]}">
          <span style = "color: #DC3545">const</span>
          <span style = "color: #007BFF">${item.type} </span>
          <span>${item.value}</span> 
          <button class="btn" style="float:right; padding:0px; margin-right: 10px; position: relative;" onclick = "deleteDataItem(${highest_headers_page_variable_sequence}, ${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]})"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;"></i> </button>
          <button class="btn" style="float:right; padding:0px; margin-right: 5px; position: relative;" onclick = "editDataItem(${highest_headers_page_variable_sequence}, ${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]})"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
        </div>
      </div>
    `;
    } else {
      tempHTML += `
      <div class="data-container" id = "${highest_headers_page_variable_sequence}">
        <div class="data-name">
          ${item.name}
          <button class="btn" style="float:right; padding:0px; margin-right: 0px; top: -3px; position: relative;" onclick="changeDataContainerState('delete', '${highest_headers_page_variable_sequence}', 'vars', '${item.name}')"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;"></i> </button>
          <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('add', '${highest_headers_page_variable_sequence}', 'vars')"> <i class="fa-solid fa-circle-plus fa-lg" style="color: #1f2551;"></i> </button>
          <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('edit', '${highest_headers_page_variable_sequence}', 'vars')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
        </div>
        <div class="data-item"  id = "${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]}">
          <span style = "color: #007BFF">${item.type} </span>
          <span>${item.value}</span>
          <button class="btn" style="float:right; padding:0px; margin-right: 10px; position: relative;" onclick = "deleteDataItem(${highest_headers_page_variable_sequence}, ${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]})"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;"></i> </button>
          <button class="btn" style="float:right; padding:0px; margin-right: 5px; position: relative;" onclick = "editDataItem(${highest_headers_page_variable_sequence}, ${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]})"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
        </div>
      </div>
    `;
    }
    highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence] += 1;
    highest_headers_page_variable_sequence += 1;
  }

  html_block.innerHTML = tempHTML;
  highest_headers_page_variable_sequence += 1;
}

function InjectHeaders(html_block, headers) {
  var tempHTML = `<div style="position: relative; top: 0; left: 0; width: 100%; height: 40px; background-color: transparent; margin-bottom: 10px; border-radius: 5px;">
                    <span style="position: absolute; top: 15px; left: 8px; z-index: 15"><i class="fa-solid fa-magnifying-glass fa-lg" style="color: #1f2551;"></i></span>
                    <input type="text" style="position: absolute; top: 0; left: 0; width: 200px; height: 30px; border-radius: 5px; padding: 5px; padding-right: 45px;">
                    <div class="add-icon" onclick="addHeaderPageItem('headers')">Add New Headers</div>
                  </div>`;
  for (let i = 0; i < headers.length; i++) {
    var item = headers[i];

    tempHTML += `
      <div class="data-container" id = "${highest_headers_page_variable_sequence}">
        <div class="data-name">
          ${item.name}
          <button class="btn" style="float:right; padding:0px; margin-right: 0px; top: -3px; position: relative;" onclick="changeDataContainerState('delete', '${highest_headers_page_variable_sequence}', 'headers', '${item.name}')"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;"></i> </button>
          <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('add', '${highest_headers_page_variable_sequence}', 'headers')"> <i class="fa-solid fa-circle-plus fa-lg" style="color: #1f2551;"></i> </button>
          <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('edit', '${highest_headers_page_variable_sequence}', 'headers')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
      </div>
        ${generateFieldsHTML(item.fields)}
      </div>
    `;
    highest_headers_page_variable_sequence += 1;
  }

  html_block.innerHTML = tempHTML;

  function generateFieldsHTML(fields) {
    var fieldsHTML = '';
    for (let i = 0; i < fields.length; i++) {
      var field = fields[i];
      fieldsHTML += `
        <div class="data-item" id = "${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]}">
          <span style = "color: #007BFF">${field.type}</span>
          <span>${field.name}</span>
          <button class="btn" style="float:right; padding:0px; margin-right: 10px; position: relative;" onclick = "deleteDataItem(${highest_headers_page_variable_sequence}, ${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]})"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;"></i> </button>
          <button class="btn" style="float:right; padding:0px; margin-right: 5px; position: relative;" onclick = "editDataItem(${highest_headers_page_variable_sequence}, ${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]})"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
        </div>
      `;
      highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence] += 1;
    }
    return fieldsHTML;
  }
  highest_headers_page_variable_sequence += 1;
}

function InjectStructs(html_block, structs) {
  var tempHTML = `<div style="position: relative; top: 0; left: 0; width: 100%; height: 40px; background-color: transparent; margin-bottom: 10px; border-radius: 5px;">
                    <span style="position: absolute; top: 15px; left: 8px; z-index: 15"><i class="fa-solid fa-magnifying-glass fa-lg" style="color: #1f2551;"></i></span>
                    <input type="text" style="position: absolute; top: 0; left: 0; width: 200px; height: 30px; border-radius: 5px; padding: 5px; padding-right: 45px;">
                    <div class="add-icon" onclick="addHeaderPageItem('structs')">Add New Structs</div>
                  </div>`;
  for (let i = 0; i < structs.length; i++) {
    var item = structs[i];
    tempHTML += `
      <div class="data-container" id = "${highest_headers_page_variable_sequence}">
        <div class="data-name">
            ${item.name}
            <button class="btn" style="float:right; padding:0px; margin-right: 0px; top: -3px; position: relative;" onclick="changeDataContainerState('delete', '${highest_headers_page_variable_sequence}', 'structs', '${item.name}')"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;"></i> </button>
            <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('add', '${highest_headers_page_variable_sequence}', 'structs')"> <i class="fa-solid fa-circle-plus fa-lg" style="color: #1f2551;"></i> </button>
            <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('edit', '${highest_headers_page_variable_sequence}', 'structs')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
        </div>
        ${generateContentHTML(item.content)}
      </div>
    `;
    highest_headers_page_variable_sequence += 1;
  }

  html_block.innerHTML = tempHTML;

  function generateContentHTML(content) {
    var contentHTML = "";
    for (let i = 0; i < content.length; i++) {
      var subItem = content[i];
      contentHTML += `
          <div class="data-item" id = "${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]}">
            <span style = "color: #007BFF">${subItem.type}</span>
            <span>${subItem.name}</span>
            <button class="btn" style="float:right; padding:0px; margin-right: 10px; position: relative;" onclick = "deleteDataItem(${highest_headers_page_variable_sequence}, ${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]})"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;"></i> </button>
            <button class="btn" style="float:right; padding:0px; margin-right: 5px; position: relative;" onclick = "editDataItem(${highest_headers_page_variable_sequence}, ${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]})"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
          </div>
      `;
      highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence] += 1;
    }
    return contentHTML;
  }

}

function InjectTypedefs(html_block, typedefs) {
  var tempHTML = `<div style="position: relative; top: 0; left: 0; width: 100%; height: 40px; background-color: transparent; margin-bottom: 10px; border-radius: 5px;">
                    <span style="position: absolute; top: 15px; left: 8px; z-index: 15"><i class="fa-solid fa-magnifying-glass fa-lg" style="color: #1f2551;"></i></span>
                    <input type="text" style="position: absolute; top: 0; left: 0; width: 200px; height: 30px; border-radius: 5px; padding: 5px; padding-right: 45px;">
                    <div class="add-icon" onclick="addHeaderPageItem('typedefs')">Add New Typedefs</div>
                  </div>`;
  for (let i = 0; i < typedefs.length; i++) {
    var elem = typedefs[i];
    tempHTML += `
    <div class="data-container" id = "${highest_headers_page_variable_sequence}">
      <div class="data-name">
        ${elem.name}
        <button class="btn" style="float:right; padding:0px; margin-right: 0px; top: -3px; position: relative;" onclick="changeDataContainerState('delete', '${highest_headers_page_variable_sequence}', 'typedefs', '${elem.name}')"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;"></i> </button>
        <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('add', '${highest_headers_page_variable_sequence}', 'typedefs')"> <i class="fa-solid fa-circle-plus fa-lg" style="color: #1f2551;"></i> </button>
        <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('edit', '${highest_headers_page_variable_sequence}', 'typedefs')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
      </div>
      <div class="data-item" id = "${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]}">
        <span style = "color: #007BFF">bit<${elem.bit}></span>
        <button class="btn" style="float:right; padding:0px; margin-right: 10px; position: relative;" onclick = "deleteDataItem(${highest_headers_page_variable_sequence}, ${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]})"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;"></i> </button>
        <button class="btn" style="float:right; padding:0px; margin-right: 5px; position: relative;" onclick = "editDataItem(${highest_headers_page_variable_sequence}, ${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]})"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
      </div>
    </div>
  `;
    highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence] += 1;
    highest_headers_page_variable_sequence += 1;
  }
  html_block.innerHTML = tempHTML;

}

function addHeaderPageItem(type) {
  var selector = document.querySelector(`.headers-page-item#${type}`);
  /* To be replaced later. */
  var random_name_for_testing_only = Math.random().toString(36).slice(2, 7);
  switch (type) {
    case "headers": selector.innerHTML += `
                                          <div class="data-container" id = "${highest_headers_page_variable_sequence}">
                                            <div class="data-name">
                                                ${random_name_for_testing_only}
                                                <button class="btn" style="float:right; padding:0px; margin-right: 0px; top: -3px; position: relative;"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;" onclick="changeDataContainerState('delete', '${highest_headers_page_variable_sequence}', 'headers', '${random_name_for_testing_only}')"></i> </button>
                                                <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;"> <i class="fa-solid fa-circle-plus fa-lg" style="color: #1f2551;" onclick="changeDataContainerState('add', '${highest_headers_page_variable_sequence}', 'headers', '${random_name_for_testing_only}', 'Subfield Placeholder')"></i> </button>
                                                <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('edit', '${highest_headers_page_variable_sequence}', 'headers')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
                                            </div>
                                          `;
      break;
    case "typedefs": selector.innerHTML += `
                                            <div class="data-container" id = "${highest_headers_page_variable_sequence}">
                                              <div class="data-name">
                                                  ${random_name_for_testing_only}
                                                  <button class="btn" style="float:right; padding:0px; margin-right: 0px; top: -3px; position: relative;"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;" onclick="changeDataContainerState('delete', '${highest_headers_page_variable_sequence}', 'typedefs', '${random_name_for_testing_only}')"></i> </button>
                                                  <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;"> <i class="fa-solid fa-circle-plus fa-lg" style="color: #1f2551;" onclick="changeDataContainerState('add', '${highest_headers_page_variable_sequence}', 'typedefs', '${random_name_for_testing_only}', 'Subfield Placeholder')"></i> </button>
                                                  <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('edit', '${highest_headers_page_variable_sequence}', 'typedefs')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
                                              </div>
                                            `;
      break;
    case "structs": selector.innerHTML += ` 
                                            <div class="data-container" id = "${highest_headers_page_variable_sequence}">
                                            <div class="data-name">
                                                ${random_name_for_testing_only}
                                                <button class="btn" style="float:right; padding:0px; margin-right: 0px; top: -3px; position: relative;"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;" onclick="changeDataContainerState('delete', '${highest_headers_page_variable_sequence}', 'structs', '${random_name_for_testing_only}')"></i> </button>
                                                <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;"> <i class="fa-solid fa-circle-plus fa-lg" style="color: #1f2551;" onclick="changeDataContainerState('add', '${highest_headers_page_variable_sequence}', 'structs', '${random_name_for_testing_only}', 'Subfield Placeholder')"></i> </button>
                                                <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('edit', '${highest_headers_page_variable_sequence}', 'structs')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
                                            </div>
                                          `;
      break;
    case "vars": selector.innerHTML += ` 
                                          <div class="data-container" id = "${highest_headers_page_variable_sequence}">
                                          <div class="data-name">
                                              ${random_name_for_testing_only}
                                              <button class="btn" style="float:right; padding:0px; margin-right: 0px; top: -3px; position: relative;"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;" onclick="changeDataContainerState('delete', '${highest_headers_page_variable_sequence}', 'vars', '${random_name_for_testing_only}')"></i> </button>
                                              <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;"> <i class="fa-solid fa-circle-plus fa-lg" style="color: #1f2551;" onclick="changeDataContainerState('add', '${highest_headers_page_variable_sequence}', 'vars', '${random_name_for_testing_only}', 'Subfield Placeholder')"></i> </button>
                                              <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('edit', '${highest_headers_page_variable_sequence}', 'vars')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
                                          </div>
                                        `;
      break;
  }
  changeDataContainerState("add", highest_headers_page_variable_sequence, type, random_name_for_testing_only);
  highest_headers_page_variable_sequence += 1;
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
      var sg_index = -1;
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

function inferStateExtractionTarget(INIT_HEADER_PAGE_DATA) {
  var extraction_targets = [];
  /* Infers the extract target for State modules, then inject into the dropdown menu */
  for (let i = 0; i < INIT_HEADER_PAGE_DATA["structs"].length; i++) {
    if (INIT_HEADER_PAGE_DATA["structs"][i]["name"] == "headers") {
      state_target_header_info = INIT_HEADER_PAGE_DATA["structs"][i];
      break;
    }
  }
  /* Generate possible options */
  for (let i = 0; i < state_target_header_info["content"].length; i++) {
    var type = state_target_header_info["content"][i]["type"];
    var name = state_target_header_info["content"][i]["name"];
    /* dive into all options under header `type` */
    for (let j = 0; j < INIT_HEADER_PAGE_DATA["headers"].length; j++) {
      if (type == INIT_HEADER_PAGE_DATA["headers"][j]["name"]) {
        for (let k = 0; k < INIT_HEADER_PAGE_DATA["headers"][j]["fields"].length; k++) {
          /* TODO: change it later!!!!! We should not hardcode hdr to extraction targets.*/
          extraction_targets.push(`hdr.${name}.${INIT_HEADER_PAGE_DATA["headers"][j]["fields"][k]["name"]}`);
        }
      }
    }
  }

  return extraction_targets;
}

/* Hotflix, will clean up after I have time... This is pretty much exactly the same code as the above. */
function updateStateExtractionTarget() {
  var extraction_targets = [];
  /* Infers the extract target for State modules, then inject into the dropdown menu */
  for (let i = 0; i < global_init_header_page_data["structs"].length; i++) {
    if (global_init_header_page_data["structs"][i]["name"] == "headers") {
      state_target_header_info = global_init_header_page_data["structs"][i];
      break;
    }
  }
  /* Generate possible options */
  for (let i = 0; i < state_target_header_info["content"].length; i++) {
    var type = state_target_header_info["content"][i]["type"];
    var name = state_target_header_info["content"][i]["name"];
    /* dive into all options under header `type` */
    for (let j = 0; j < global_init_header_page_data["headers"].length; j++) {
      if (type == global_init_header_page_data["headers"][j]["name"]) {
        for (let k = 0; k < global_init_header_page_data["headers"][j]["fields"].length; k++) {
          /* TODO: change it later!!!!! We should not hardcode hdr to extraction targets.*/
          extraction_targets.push(`hdr.${name}.${global_init_header_page_data["headers"][j]["fields"][k]["name"]}`);
        }
      }
    }
  }

  return extraction_targets;
}

function generateNewStateExtractionDropdown() {
  dropdownDivs = newDiv.getElementsByClassName("dropdown-content");
  console.log(dropdownDivs);
  for (let i = 1; i < dropdownDivs.length; i++) {
    const target_div = dropdownDivs[i];
    var tempHTML = ""
    for (let i = 0; i < state_extraction_targets.length; i++) {
      tempHTML += `<button class="dropdown-content-item" onclick="dropdownContentItemHandler('${node_id}', '${highest_node_sequence[node_id]}', 'target', '${state_extraction_targets[i]}')">${state_extraction_targets[i]}</button>\n`;
    }
    target_div.innerHTML = tempHTML;
  }
}

function inferStateConditionTarget(INIT_HEADER_PAGE_DATA) {
  var condition_targets = ["default"];
  /* Infers the extract target for State modules, then inject into the dropdown menu */
  for (let i = 0; i < INIT_HEADER_PAGE_DATA["vars"].length; i++) {
    condition_targets.push(INIT_HEADER_PAGE_DATA["vars"][i]["name"]);
  }
  return condition_targets;
}

/* Hotflix, will clean up after I have time... This is pretty much exactly the same code as the above. */
function updateStateConditionTarget() {
  var condition_targets = ["default"];
  /* Infers the extract target for State modules, then inject into the dropdown menu */
  for (let i = 0; i < global_init_header_page_data["vars"].length; i++) {
    condition_targets.push(global_init_header_page_data["vars"][i]["name"]);
  }
  return condition_targets;
}

function generateNewStateConditionDropdown() {
  /* Lets test whether the main dropdowns work... */
}


function resolveExtractionTargets() {
  return new Promise((resolve) => {
    const checkVariableType = setInterval(() => {
      if (Array.isArray(state_extraction_targets) && Array.isArray(state_condition_targets)) {
        clearInterval(checkVariableType);
        resolve();
      }
    }, 100);
  });
}

function resolveConditionHTML() {
  return new Promise((resolve, reject) => {
    const checkVariableType = setInterval(() => {
      const dropdownElements = document.querySelectorAll('.condition-selector .dropdown');
      console.log(dropdownElements);
      if (dropdownElements.length) {
        raw_condition_html = dropdownElements;
        clearInterval(checkVariableType);
        resolve();
      }
    }, 100);

    // Reject the promise after a certain time
    setTimeout(() => {
      clearInterval(checkVariableType);
      reject();
    }, 100); // Set a timeout value for the rejection (e.g., 5 seconds)
  })
    .catch(() => {
      // Do nothing if the promise is rejected
    });
}

async function injectLinkTargets() {
  await resolveExtractionTargets();
  await resolveConditionHTML();
  if (raw_condition_html && state_extraction_targets) {
    console.log("condition met", raw_condition_html);
    /* Menu */
    raw_condition_html[0].querySelector(".dropdown-content");
    temp_menu_html = "";
    /* Target */
    raw_condition_html[1].querySelector(".dropdown-content");
    temp_target_html = "";
    /* Extract ID */
    var connection_id = raw_condition_html[0].querySelector(".dropdown-content").id;
    /* Inject menu functions. */
    for (let i = 0; i < state_extraction_targets.length; i++) {
      temp_menu_html += `<button class="dropdown-content-item" onclick = 'dropdownContentItemConnectionHandler("${connection_id.slice(0, -9)}", "switch-head", "${state_extraction_targets[i]}: ")' style = "z-index: 2;">${state_extraction_targets[i]}</button>\n`;
    }
    /* Inject Conditions */
    for (let i = 0; i < state_condition_targets.length; i++) {
      temp_target_html += `<button class="dropdown-content-item" onclick = 'dropdownContentItemConnectionHandler("${connection_id.slice(0, -9)}", "switch-target", "${state_condition_targets[i]}")' style = "z-index: 2;">${state_condition_targets[i]}</button>\n`;
    }

    raw_condition_html[0].querySelector(".dropdown-content").innerHTML = temp_menu_html;
    raw_condition_html[1].querySelector(".dropdown-content").innerHTML = temp_target_html;

  } else {
    console.log("not done yet");
  }
}


function changeDataContainerState(action, sequence_id, type, name = null, subfield = null) {
  /* Planning to take in subfield as a string, exact format has not been decided yet... */
  switch (action) {
    case "add":
      var element = document.querySelector(`.data-container[id="${sequence_id}"]`);
      element.innerHTML += `<div class="data-item"  id = "${highest_subfield_sequence_under_headers_page_variables[sequence_id]}">
                                        <span style = "color: #007BFF"> temp-${sequence_id}-${highest_subfield_sequence_under_headers_page_variables[sequence_id]} </span>
                                        <span> </span>
                                        <button class="btn" style="float:right; padding:0px; margin-right: 10px; position: relative;" onclick = "deleteDataItem(${sequence_id}, ${highest_subfield_sequence_under_headers_page_variables[sequence_id]})"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;"></i> </button>
                                        <button class="btn" style="float:right; padding:0px; margin-right: 5px; position: relative;" onclick = "editDataItem(${sequence_id}, ${highest_subfield_sequence_under_headers_page_variables[sequence_id]})"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
                                      </div>`
      /* Add extraction targets to dropdown menus */
      if (name) {
        /* If name is not defined, that indicates changeDataContainerState is called from initial html injection. */
        syncDropdownContent("add", type, sequence_id, name, subfield);
      }
      highest_subfield_sequence_under_headers_page_variables[sequence_id] += 1;
      break;
    case "delete": var element = document.querySelector(`.data-container[id="${sequence_id}"]`);
      element.remove();
      /* Remove extraction targets to dropdown menus */
      syncDropdownContent("remove", type, sequence_id, name);
      break;
    case "edit":
      /* Edit the name of the main component. */
      /* Same logic as editing data items, for edit, then reformulate. */
      var element = document.querySelector(`.data-container[id="${sequence_id}"]`);
      var name_div = element.querySelector(`.data-name`);
      var divs_under_subfield = name_div.children;

      var string = name_div.textContent.trim();
      divs_under_subfield[divs_under_subfield.length - 1].children[0].setAttribute('class', 'fa-solid fa-check fa-lg');
      /* Convert something to a textbox with the option of an onclick. */

      /* Hacky solution... Modify the innerHTML of the thing directly. */
      // Create a regular expression using the variable
      const regex = new RegExp(string, 'g');
      counter = 0;
      // Replace the first occurrence of the pattern with a specific value
      name_div.innerHTML = name_div.innerHTML.replace(regex, (match) => {
        if (match === `${string}` && counter == 0) {
          counter += 1;
          return `<input id = "dataname-${sequence_id}" type="text" value="${string}"></input>\n`;
        }
        return match;
      });

      console.log(name_div.innerHTML);
      divs_under_subfield[divs_under_subfield.length - 1].setAttribute('onclick', `reformulateDataName(${sequence_id}, "${type}", "${name}", "${subfield}")`);

      break;
  }
}

function syncDropdownContent(mode, type, sequence_id, name = null, subfield = null, target = null) {
  /* Modify extraction targets and condition targets. */
  switch (mode) {
    case "add": if (subfield) {
      /* To be completed whenever subfield additions are completed. */
      /* 1. Search for names, if they already have been inserted before. */
      /* 2. Do insertion. */
      /* Not activated for now because everything is a mess. */
    } else {
      global_init_header_page_data[type].push({ "name": name });
    }
      break;
    case "remove":
      for (let doc in global_init_header_page_data[type]) {
        console.log(global_init_header_page_data[type][doc]["name"], name)
        if (global_init_header_page_data[type][doc]["name"] == name) {
          global_init_header_page_data[type].splice(doc);
          break;
        }
      }
      break;
    case "edit":
      if (subfield == null || subfield == "null") {
        // This means that we are modifying the name of existing thing. 
        if (!window.header_name_dict.hasOwnProperty(target)) {
          // There should be a check in place that detects duplicate entries, preferrably a popup window.
          // I will just block this thing from happening whenever this situation arises...
          var origin_index = window.header_name_dict[name];
          global_init_header_page_data[type][origin_index]["name"] = target;
        }
      } else {
        // we are editing the name of a subfield.
        var origin_index = window.header_name_dict[name];
        console.log(global_init_header_page_data[type][origin_index]["name"]);
      }
      break;
    default: break;
  }
  /* Regenerate existing dropdown menus, if there is any out there. */
  state_extraction_targets = updateStateExtractionTarget();
  state_condition_targets = updateStateConditionTarget();
}

function deleteDataItem(sequence_id, subfield_sequence) {
  var seq_div = document.querySelector(`.data-container[id="${sequence_id}"]`);
  var subfield_div = seq_div.querySelector(`.data-item[id="${subfield_sequence}"]`);
  subfield_div.remove();
}

function editDataItem(sequence_id, subfield_sequence) {
  var seq_div = document.querySelector(`.data-container[id="${sequence_id}"]`);
  var subfield_div = seq_div.querySelector(`.data-item[id="${subfield_sequence}"]`);
  // Extract all textual components into a formatted string and display that string in a text box.
  var divs_under_subfield = subfield_div.children;
  divs_under_subfield[divs_under_subfield.length - 1].children[0].setAttribute('class', 'fa-solid fa-check fa-lg');
  divs_under_subfield[divs_under_subfield.length - 1].setAttribute('onclick', `reformulateDataItem(${sequence_id}, ${subfield_sequence})`);
  var string = "";
  while (divs_under_subfield.length > 2) {
    string += divs_under_subfield[0].innerHTML;
    string += " ";
    divs_under_subfield[0].remove();
  }
  var cached_html = subfield_div.innerHTML;
  var text_bar = `<input id = "i-${sequence_id}-${subfield_sequence}" type="text" value="${string}">\n`;
  subfield_div.innerHTML = text_bar + cached_html;
}

function reformulateDataItem(sequence_id, subfield_sequence) {
  var seq_div = document.querySelector(`.data-container[id="${sequence_id}"]`);
  var subfield_div = seq_div.querySelector(`.data-item[id="${subfield_sequence}"]`);
  var input_element = document.querySelector(`input#i-${sequence_id}-${subfield_sequence}`);
  var divs_under_subfield = subfield_div.children;
  input_value = input_element.value;
  input_fields = input_value.replace(/\s+/g, ' ').trim().split(" ");
  returned_div = null;
  switch (input_fields.length) {
    case 1: returned_div = `<span style = "color: #007BFF">${input_fields[0]} </span>\n`
      break;
    case 2: returned_div = `<span style = "color: #007BFF">${input_fields[0]} </span>
             <span>${input_fields[1]}</span>\n`
      break;
    case 3: returned_div = `<span style = "color: #DC3545">${input_fields[0]}</span>
             <span style = "color: #007BFF">${input_fields[1]} </span>
             <span>${input_fields[2]}</span>\n`
      break;
    default: break;
  }
  divs_under_subfield[0].remove();
  var cached_html = subfield_div.innerHTML;
  subfield_div.innerHTML = returned_div + cached_html;
  divs_under_subfield[divs_under_subfield.length - 1].children[0].setAttribute('class', 'fa-solid fa-pen-to-square fa-lg');
  divs_under_subfield[divs_under_subfield.length - 1].setAttribute('onclick', `editDataItem(${sequence_id}, ${subfield_sequence})`);
}

function reformulateDataName(sequence_id, type = null, name = null, subfield = null) {
  var input_element = document.querySelector(`input#dataname-${sequence_id}`);
  input_value = input_element.value.trim();
  returned_div = input_value + '\n';
  input_element.remove();

  var element = document.querySelector(`.data-container[id="${sequence_id}"]`);
  var name_div = element.querySelector(`.data-name`);
  name_div.innerHTML = returned_div + name_div.innerHTML;
  divs_under_subfield = name_div.children;

  divs_under_subfield[divs_under_subfield.length - 1].children[0].setAttribute('class', 'fa-solid fa-pen-to-square fa-lg');
  divs_under_subfield[divs_under_subfield.length - 1].setAttribute('onclick', `changeDataContainerState('edit', '${sequence_id}', 'vars')`);

  /* Edit name to dropdown menus. */
  console.log("edit", type, sequence_id, name, typeof subfield, input_value);
  syncDropdownContent("edit", type, sequence_id, name, subfield, input_value);
}

window.addEventListener("resize", reportWindowSize);
window.addEventListener("keydown", captureCode);
window.addEventListener("contextmenu", injectLinkTargets);

/***********************************Misc functions****************************/
function addActionModuleStatements(node_id) {
  console.log("line 207");
}
async function addStateModuleStatements(node_id) {
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
  /* inject `state_extract_targets` into corresponding fields. */
  await resolveExtractionTargets();
  dropdownDivs = newDiv.getElementsByClassName("dropdown-content");
  console.log(dropdownDivs);
  const target_div = dropdownDivs[1];
  var tempHTML = ""
  for (let i = 0; i < state_extraction_targets.length; i++) {
    tempHTML += `<button class="dropdown-content-item" onclick="dropdownContentItemHandler('${node_id}', '${highest_node_sequence[node_id]}', 'target', '${state_extraction_targets[i]}')">${state_extraction_targets[i]}</button>\n`;
  }
  target_div.innerHTML = tempHTML;

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
