/* Before you come here and yell me at these global constants... I know these are not good. 
   But I don't feel the need to change anything for now. */

/******************************** JS Metadata *****************************/
let height = 0;
let global_editor = [null];
let global_editor_values = [null];
let global_init_header_page_data = null;
let global_init_action_page_data = null;
let current_input = null;
let current_selected_window = 0;
let fileCount = 0;
let global_node_dict = [];
let global_flow_editor = null;
let global_slider = null;
let display_code = false;
let display_headers_page = false;
let display_actions_page = false;
let init_load = true;
let types = ["vars", "structs", "typedefs", "headers"];
/* TODO: Change autoCompleteData */
/* 
  autoCompleteData sources keywords from the following sources:
  1. global_init_header_page_data
  2. global_init_action_page_data
  3. There might be more, but I don't remember. Let's add as we go.
*/
let autoCompleteData = [];
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
  switch (sequence_id) {
    case 0:
      return `<div class="action-statement" id = "${node_id} ${sequence_id}">
               Description
               <textarea class="autocompleteInput" id = "${node_id} ${sequence_id}" type="text" autocomplete="off"></textarea>
               <span id="autocompleteBase"></span>
              </div>`;
    case 1:
      return `<div class="action-statement" id = "${node_id} ${sequence_id}">
               Inputs
               <textarea class="autocompleteInput" id = "${node_id} ${sequence_id}" type="text" autocomplete="off"></textarea>
               <span id="autocompleteBase"></span>
              </div>`;
    case 2:
      return `<div class="action-statement" id = "${node_id} ${sequence_id}">
               Outputs
               <textarea class="autocompleteInput" id = "${node_id} ${sequence_id}" type="text" autocomplete="off"></textarea>
               <span id="autocompleteBase"></span>
              </div>`;
    case 3:
      return `<div class="action-statement" id="${node_id} ${sequence_id}" onclick="expandActionCode('${node_id}', '${sequence_id}')">
                  Click here to show code
              </div>
              <div class="blur-filter ${node_id}-${sequence_id}"
                style="z-index: 15; backdrop-filter: blur(5px); position: fixed; display: none; width:100%;height: 100%; top: 0;left: 0;background-color: transparent;">
              </div>
              <textarea id="code ${node_id} ${sequence_id}" rows="40" style="caret-color: white; position: fixed; width: 50%; height: 50%; top: 25%; left: 25%;" autofocus></textarea>
              <button id="action-code-hide-${node_id}-${sequence_id}" style="position: fixed; display: none; z-index: 20; top: 25%; right: 20%; background-color: transparent; height: 3%; width: 3%; justify-content: center; align-items: center;" onclick="hideActionCode('${node_id}', '${sequence_id}');"> 
              <i class="fa fa-times-circle" style="position:relative;font-size:24px;color:red"></i>
              </button>
              `;
    default:
      return '';
  }
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

let INJECT_HEADER_FUNCS = {
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
  var startingValue = "/**\nWelcome to the VisualP4 IDE!\nDevelopment Version: 2023.08.19\n**/";
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

  injectLinkTargets_async().then(init_load = false);
  /* Observer to observe DOM changes. */
  const observer = new MutationObserver((mutationsList, observer) => {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.childNodes[0] && node.childNodes[0].className == "action-statement") {
            // Add event listener once the code statement is added
            if (node.childNodes[4] && node.childNodes[4].id.slice(0, 4) == "code") {
              codeTextArea = node.childNodes[4];
              CodeMirror.fromTextArea(codeTextArea, {
                lineNumbers: false,
                tabSize: 2,
              });
            }
            // Add event listener to the new input
            node.addEventListener('input', function (e) {
              // Ensure the event is from an input element you want to autocomplete
              console.log('hahaa', e.target)
              if (e.target.className === 'autocompleteInput') { // I'm using a class name to identify relevant input elements
                let inputValue = e.target.value;

                if (inputValue.includes(" ")) {
                  splitValues = inputValue.split(" ");
                  if (splitValues[splitValues.length - 1] == "") {
                    inputValue = null;
                  } else {
                    inputValue = splitValues[splitValues.length - 1];
                  }
                }

                console.log("input val", inputValue);
                // Reset the suggested word data attribute on every input
                e.target.dataset.suggestedWord = "";

                // Check if any word in autoCompleteData starts with the input value
                for (let word of autoCompleteData) {
                  if (word.startsWith(inputValue)) {
                    // Store the current suggested word in the data attribute
                    e.target.dataset.suggestedWord = word;
                    // Display the suggestion in some manner (e.g., as a placeholder)
                    e.target.placeholder = word;
                    console.log("in here!", e.target.dataset.suggestedWord, e.target.placeholder);
                    break;
                  }
                }

                let span = node.querySelectorAll('span')[0];

                let span_id = span.id;

                let span_id_split = span_id.split(' ');

                let node_id = span_id_split[1];

                let sequence_id = span_id_split[2];

                console.log(node_id, sequence_id);

                // Inside your input event listener:
                for (let word of autoCompleteData) {
                  if (word.startsWith(inputValue)) {
                    // Only set the suggestion part to the span (subtracting what the user already typed)
                    span.textContent = "↹ " + inputValue + word.substring(inputValue.length);
                    break;
                  } else {
                    span.textContent = "";  // If no match, show only the user's input
                  }
                }
              }
            }
            );
            node.addEventListener('input', function (event) {
              if (event.target.tagName.toLowerCase() === 'textarea' && event.target.className.toLowerCase() == 'autocompleteinput') {
                const textarea = event.target;
                if (textarea.selectionStart % 38 == 0) {
                  if (!textarea.style.height) {
                    textarea.style.height = 64 + parseInt(window.getComputedStyle(textarea, null).getPropertyValue('line-height').slice(0, -2)) + "px";
                  } else {
                    textarea.style.height = 64 + parseInt(window.getComputedStyle(textarea, null).getPropertyValue('line-height').slice(0, -2)) * parseInt(textarea.selectionStart / 38) + "px";
                  }

                }
              }
            });
          }
        });
      }
    }
  });

  const config = {
    childList: true,
    subtree: true
  };

  observer.observe(document.body, config);

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

function ActionDisplaySetting() {
  const actionsPage = document.querySelector(".actions-page");
  // User can toggle a headers page with this
  if (display_actions_page) {
    actionsPage.classList.add("show");
  } else {
    actionsPage.classList.remove("show");
  }
  display_actions_page = !display_actions_page;
}

function ActionPageData(INIT_HEADER_PAGE_DATA) {
  // Reads the initial header data stored in './APD/'
  const directoryPath = "./HPD/";
  var INIT_ACTION_PAGE_DATA = {};

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
          INIT_ACTION_PAGE_DATA[file_name.slice(0, -5)] = jsonData;
          console.log("JSON data stored in INIT_ACTION_PAGE_DATA:", file_name.slice(0, -5));
        }
      })
      .then(() => {
        resolve(INIT_ACTION_PAGE_DATA);
        global_init_action_page_data = INIT_ACTION_PAGE_DATA;
        for (let index in types) {
          var type = types[index];
          for (let doc in global_init_action_page_data[type]) {
            var name = global_init_action_page_data[type][doc]["name"];
            window.header_name_dict[name] = doc;
          }
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
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
          INJECT_HEADER_FUNCS[file_name.slice(0, -5)](
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

function extractValues(obj, arr = []) {
  for (let key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      extractValues(obj[key], arr);
    } else {
      if (!arr.includes(obj[key])) {
        if (typeof obj[key] === "string") {
          arr.push(obj[key]);
        }
      }
    }
  }
  return arr;
}

function InjectAction() {
  /* TODO: Fill in this part ASAP!*/
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
            <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('add', '${highest_headers_page_variable_sequence}', 'vars', '${item.name}')"> <i class="fa-solid fa-circle-plus  fa-lg" style="color: #1f2551;"></i> </button>
            <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('edit', '${highest_headers_page_variable_sequence}', 'vars', '${item.name}')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
        </div>
        <div class="data-item" id = "${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]}">
          <span style = "color: #DC3545">const</span>
          <span style = "color: #007BFF">${item.type} </span>
          <span>${item.value}</span> 
          <button class="btn" style="float:right; padding:0px; margin-right: 10px; position: relative;" onclick = "deleteDataItem(${highest_headers_page_variable_sequence}, ${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]}, '${item.name}', 'vars')"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;"></i> </button>
          <button class="btn" style="float:right; padding:0px; margin-right: 5px; position: relative;" onclick = "editDataItem(${highest_headers_page_variable_sequence}, ${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]}, '${item.name}', 'vars')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
        </div>
      </div>
    `;
    } else {
      tempHTML += `
      <div class="data-container" id = "${highest_headers_page_variable_sequence}">
        <div class="data-name">
          ${item.name}
          <button class="btn" style="float:right; padding:0px; margin-right: 0px; top: -3px; position: relative;" onclick="changeDataContainerState('delete', '${highest_headers_page_variable_sequence}', 'vars', '${item.name}')"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;"></i> </button>
          <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('add', '${highest_headers_page_variable_sequence}', 'vars', '${item.name}')"> <i class="fa-solid fa-circle-plus fa-lg" style="color: #1f2551;"></i> </button>
          <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('edit', '${highest_headers_page_variable_sequence}', 'vars', '${item.name}')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
        </div>
        <div class="data-item"  id = "${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]}">
          <span style = "color: #007BFF">${item.type} </span>
          <span>${item.value}</span>
          <button class="btn" style="float:right; padding:0px; margin-right: 10px; position: relative;" onclick = "deleteDataItem(${highest_headers_page_variable_sequence}, ${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]}, '${item.name}', 'vars')"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;"></i> </button>
          <button class="btn" style="float:right; padding:0px; margin-right: 5px; position: relative;" onclick = "editDataItem(${highest_headers_page_variable_sequence}, ${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]}, '${item.name}', 'vars')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
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
          <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('add', '${highest_headers_page_variable_sequence}', 'headers', '${item.name}')"> <i class="fa-solid fa-circle-plus fa-lg" style="color: #1f2551;"></i> </button>
          <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('edit', '${highest_headers_page_variable_sequence}', 'headers', '${item.name}')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
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
          <button class="btn" style="float:right; padding:0px; margin-right: 10px; position: relative;" onclick = "deleteDataItem(${highest_headers_page_variable_sequence}, ${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]}, '${item.name}', 'headers')"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;"></i> </button>
          <button class="btn" style="float:right; padding:0px; margin-right: 5px; position: relative;" onclick = "editDataItem(${highest_headers_page_variable_sequence}, ${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]}, '${item.name}', 'headers')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
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
            <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('add', '${highest_headers_page_variable_sequence}', 'structs', '${item.name}')"> <i class="fa-solid fa-circle-plus fa-lg" style="color: #1f2551;"></i> </button>
            <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('edit', '${highest_headers_page_variable_sequence}', 'structs', '${item.name}')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
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
            <button class="btn" style="float:right; padding:0px; margin-right: 10px; position: relative;" onclick = "deleteDataItem(${highest_headers_page_variable_sequence}, ${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]}, '${item.name}', 'structs')"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;"></i> </button>
            <button class="btn" style="float:right; padding:0px; margin-right: 5px; position: relative;" onclick = "editDataItem(${highest_headers_page_variable_sequence}, ${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]}, '${item.name}', 'structs')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
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
    var item = typedefs[i];
    tempHTML += `
    <div class="data-container" id = "${highest_headers_page_variable_sequence}">
      <div class="data-name">
        ${item.name}
        <button class="btn" style="float:right; padding:0px; margin-right: 0px; top: -3px; position: relative;" onclick="changeDataContainerState('delete', '${highest_headers_page_variable_sequence}', 'typedefs', '${item.name}')"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;"></i> </button>
        <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('add', '${highest_headers_page_variable_sequence}', 'typedefs', '${item.name}')"> <i class="fa-solid fa-circle-plus fa-lg" style="color: #1f2551;"></i> </button>
        <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('edit', '${highest_headers_page_variable_sequence}', 'typedefs', '${item.name}')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
      </div>
      <div class="data-item" id = "${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]}">
        <span style = "color: #007BFF">bit<${item.bit}></span>
        <button class="btn" style="float:right; padding:0px; margin-right: 10px; position: relative;" onclick = "deleteDataItem(${highest_headers_page_variable_sequence}, ${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]}, '${item.name}', 'typedefs')"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;"></i> </button>
        <button class="btn" style="float:right; padding:0px; margin-right: 5px; position: relative;" onclick = "editDataItem(${highest_headers_page_variable_sequence}, ${highest_subfield_sequence_under_headers_page_variables[highest_headers_page_variable_sequence]}, '${item.name}', 'typedefs')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
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
                                                <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('edit', '${highest_headers_page_variable_sequence}', 'headers', '${random_name_for_testing_only}')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
                                            </div>
                                          `;
      break;
    case "typedefs": selector.innerHTML += `
                                            <div class="data-container" id = "${highest_headers_page_variable_sequence}">
                                              <div class="data-name">
                                                  ${random_name_for_testing_only}
                                                  <button class="btn" style="float:right; padding:0px; margin-right: 0px; top: -3px; position: relative;"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;" onclick="changeDataContainerState('delete', '${highest_headers_page_variable_sequence}', 'typedefs', '${random_name_for_testing_only}')"></i> </button>
                                                  <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;"> <i class="fa-solid fa-circle-plus fa-lg" style="color: #1f2551;" onclick="changeDataContainerState('add', '${highest_headers_page_variable_sequence}', 'typedefs', '${random_name_for_testing_only}', 'Subfield Placeholder')"></i> </button>
                                                  <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('edit', '${highest_headers_page_variable_sequence}', 'typedefs', '${random_name_for_testing_only}')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
                                              </div>
                                            `;
      break;
    case "structs": selector.innerHTML += ` 
                                            <div class="data-container" id = "${highest_headers_page_variable_sequence}">
                                            <div class="data-name">
                                                ${random_name_for_testing_only}
                                                <button class="btn" style="float:right; padding:0px; margin-right: 0px; top: -3px; position: relative;"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;" onclick="changeDataContainerState('delete', '${highest_headers_page_variable_sequence}', 'structs', '${random_name_for_testing_only}')"></i> </button>
                                                <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;"> <i class="fa-solid fa-circle-plus fa-lg" style="color: #1f2551;" onclick="changeDataContainerState('add', '${highest_headers_page_variable_sequence}', 'structs', '${random_name_for_testing_only}', 'Subfield Placeholder')"></i> </button>
                                                <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('edit', '${highest_headers_page_variable_sequence}', 'structs', '${random_name_for_testing_only}')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
                                            </div>
                                          `;
      break;
    case "vars": selector.innerHTML += ` 
                                          <div class="data-container" id = "${highest_headers_page_variable_sequence}">
                                          <div class="data-name">
                                              ${random_name_for_testing_only}
                                              <button class="btn" style="float:right; padding:0px; margin-right: 0px; top: -3px; position: relative;"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;" onclick="changeDataContainerState('delete', '${highest_headers_page_variable_sequence}', 'vars', '${random_name_for_testing_only}')"></i> </button>
                                              <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;"> <i class="fa-solid fa-circle-plus fa-lg" style="color: #1f2551;" onclick="changeDataContainerState('add', '${highest_headers_page_variable_sequence}', 'vars', '${random_name_for_testing_only}', 'Subfield Placeholder')"></i> </button>
                                              <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('edit', '${highest_headers_page_variable_sequence}', 'vars', '${random_name_for_testing_only}')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
                                          </div>
                                        `;
      break;
  }
  console.log("add", highest_headers_page_variable_sequence, type, random_name_for_testing_only);
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
          autoCompleteData.push(`hdr.${name}.${INIT_HEADER_PAGE_DATA["headers"][j]["fields"][k]["name"]}`);
        }
      }
    }
  }

  return extraction_targets;
}

/* Hotflix, will clean up after I have time... This is pretty much exactly the same code as the above. */
function updateStateExtractionTarget() {
  console.log("updateStateExtractionTarget");
  var extraction_targets = [];
  /* Infers the extract target for State modules, then inject into the dropdown menu */
  for (let i = 0; i < global_init_header_page_data["structs"].length; i++) {
    if (global_init_header_page_data["structs"][i]["name"] == "headers") {
      state_target_header_info = global_init_header_page_data["structs"][i];
      break;
    }
  }
  console.log(state_target_header_info);
  /* Generate possible options */
  for (let i = 0; i < state_target_header_info["content"].length; i++) {
    var type = state_target_header_info["content"][i]["type"];
    var name = state_target_header_info["content"][i]["name"];
    console.log("haha", type, name);
    /* dive into all options under header `type` */
    for (let j = 0; j < global_init_header_page_data["headers"].length; j++) {
      console.log(type, global_init_header_page_data["headers"][j]["name"], type == global_init_header_page_data["headers"][j]["name"])
      if (type == global_init_header_page_data["headers"][j]["name"]) {
        for (let k = 0; k < global_init_header_page_data["headers"][j]["fields"].length; k++) {
          /* TODO: change it later!!!!! We should not hardcode hdr to extraction targets.*/
          console.log(`hdr.${name}.${global_init_header_page_data["headers"][j]["fields"][k]["name"]}`);
          extraction_targets.push(`hdr.${name}.${global_init_header_page_data["headers"][j]["fields"][k]["name"]}`);
        }
      }
    }
  }

  return extraction_targets;
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

function replaceLastOccurrence(str, find, replaceWith) {
  let lastIndex = str.lastIndexOf(find);

  if (lastIndex === -1) {
    return str;  // The substring was not found, return original string
  }

  let beginning = str.substring(0, lastIndex);
  let ending = str.substring(lastIndex + find.length);

  return beginning + replaceWith + ending;
}


async function injectLinkTargets_async() {
  await resolveExtractionTargets();
  await resolveConditionHTML();

  injectLinkTargets_sync();
}

function injectLinkTargets_sync(init = true) {
  console.log("inside injectLinkTargets", raw_condition_html, state_extraction_targets);

  if (state_condition_targets && state_extraction_targets) {
    /* Extract Link Target Menus */
    if (init == true && raw_condition_html) {
      temp_menu_html = "";
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
      dropdownElements = document.querySelectorAll('div.dropdown[id^="target-node-"]');
      for (let i = 0; i < dropdownElements.length; i++) {
        dropdownElement = dropdownElements[i];
        id = dropdownElement.id;
        node_id = id.split("-")[2];
        field_id = 0;
        dropdownElementContent = dropdownElement.querySelector(".dropdown-content");
        tempHTML = "";
        for (let i = 0; i < state_extraction_targets.length; i++) {
          tempHTML += `<button class="dropdown-content-item" onclick = 'dropdownContentItemConnectionHandler("node-${node_id}", "0", "target", "${state_extraction_targets[i]}: ")' style = "z-index: 2;">${state_extraction_targets[i]}</button>\n`;
        }
        dropdownElementContent.innerHTML = tempHTML;
      }
    }
    autoCompleteData = extractValues(global_init_header_page_data, autoCompleteData);
  } else {
    // Update value in global_init_header_page_data
    console.log("hits `else` in injectLinkTargets_sync");
  }
}


function changeDataContainerState(action, sequence_id, type, name = null, subfield = null) {
  /* Planning to take in subfield as a string, exact format has not been decided yet... */
  switch (action) {
    case "add":
      var element = document.querySelector(`.data-container[id="${sequence_id}"]`);
      if (type == "headers" || type == "structs" || type == "vars") {
        temp_display_string = `temp-${sequence_id}-${highest_subfield_sequence_under_headers_page_variables[sequence_id]}  temp-${sequence_id}-${highest_subfield_sequence_under_headers_page_variables[sequence_id]}`;
      } else {
        temp_display_string = `bit<10>`;
      }
      element.innerHTML += `<div class="data-item"  id = "${highest_subfield_sequence_under_headers_page_variables[sequence_id]}">
                                        <span style = "color: #007BFF"> ${temp_display_string} </span>
                                        <span> </span>
                                        <button class="btn" style="float:right; padding:0px; margin-right: 10px; position: relative;" onclick = "deleteDataItem(${sequence_id}, ${highest_subfield_sequence_under_headers_page_variables[sequence_id]}, '${name}', '${type}')"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;"></i> </button>
                                        <button class="btn" style="float:right; padding:0px; margin-right: 5px; position: relative;" onclick = "editDataItem(${sequence_id}, ${highest_subfield_sequence_under_headers_page_variables[sequence_id]}, '${name}', '${type}')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
                                      </div>`
      /* Add extraction targets to dropdown menus */
      if (name) {
        /* If name is not defined, that indicates changeDataContainerState is called from initial html injection. */
        console.log("add", type, sequence_id, name, `'${temp_display_string}'`);

        syncDropdownContent("add", type, sequence_id, name, temp_display_string);
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

      console.log(`reformulateDataName(${sequence_id}, "${type}", "${name}", "${subfield}")`);
      divs_under_subfield[divs_under_subfield.length - 1].setAttribute('onclick', `reformulateDataName(${sequence_id}, "${type}", "${name}", "${subfield}")`);

      break;
  }
}

function syncDropdownContent(mode, type, sequence_id, name = null, subfield = null, target = null) {
  console.log('syncDropdownContent', mode, type, sequence_id, name, subfield, target);
  /* Modify extraction targets and condition targets. */
  subfield_list = subfield.trim().split("  ");
  console.log(subfield_list);
  switch (mode) {
    case "add": if (subfield != null) {
      /* To be completed whenever subfield additions are completed. */
      /* 1. Search for names, if they already have been inserted before. */
      /* 2. Do insertion. */
      /* Not activated for now because everything is a mess. */
      if (!window.header_name_dict.hasOwnProperty(name)) {
        /* This means that the name has not been added before. */
        switch (type) {
          case "headers":
            global_init_header_page_data[type].push({ "name": name, "fields": [] });
            break;
          case "structs":
            global_init_header_page_data[type].push({ "name": name, "content": [] });
            break;
          default:
            global_init_header_page_data[type].push({ "name": name });
        }
        window.header_name_dict[name] = global_init_header_page_data[type].length - 1;
      }
      /* Add the subfield to the corresponding data structure. */
      /* TODO: Don't forget to change the hardcoding!!!! */
      switch (type) {
        case "headers":
          global_init_header_page_data[type][window.header_name_dict[name]]["fields"].push({ "name": subfield_list[0], "type": subfield_list[1] });
          break;
        case "structs":
          global_init_header_page_data[type][window.header_name_dict[name]]["content"].push({ "name": subfield_list[0], "type": subfield_list[1] });
          break;
        case "vars":
          global_init_header_page_data[type][window.header_name_dict[name]]["type"] = subfield_list[subfield_list.length - 2];
          global_init_header_page_data[type][window.header_name_dict[name]]["value"] = subfield_list[subfield_list.length - 1];
          global_init_header_page_data[type][window.header_name_dict[name]]["const"] = (subfield_list.length == 3) ? 1 : 0;
          break;
        case "typedef":
          global_init_header_page_data[type][window.header_name_dict[name]]["bit"] = parseInt(subfield_list[0].trim().slice(4, -1));
          break;
      }
    } else {
      console.log("added", name);
      global_init_header_page_data[type].push({ "name": name });
      window.header_name_dict[name] = global_init_header_page_data[type].length - 1;
    }
      break;
    case "remove":
      for (let doc in global_init_header_page_data[type]) {
        console.log(global_init_header_page_data[type][doc]["name"], name)
        if (global_init_header_page_data[type][doc]["name"] == name) {
          global_init_header_page_data[type].splice(doc, 1);
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
          if (!window.header_name_dict.hasOwnProperty(name)) {
            // This means that we need to add the name into the thing. 
            global_init_header_page_data[type].push({ "name": name });
            window.header_name_dict[name] = global_init_header_page_data[type].length - 1;
          }
          var origin_index = window.header_name_dict[name];
          global_init_header_page_data[type][origin_index]["name"] = target;
          window.header_name_dict[target] = origin_index;
          if (target != name) {
            delete window.header_name_dict[name];
          }

          // Change the params of the onclick field.
          var element = document.querySelector(`.data-container[id="${sequence_id}"]`);
          const buttonElement = element.querySelectorAll(".btn")[2];
          const onclickAttributeValue = buttonElement.getAttribute("onclick");
          const currentText = onclickAttributeValue.match(/'([^']*)'/g)[3];
          const newText = onclickAttributeValue.replace(currentText, `'${target}'`);
          // Update the onclick attribute with the new text
          buttonElement.setAttribute("onclick", newText);
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

function deleteDataItem(sequence_id, subfield_sequence, name, type) {
  /* Also need to port in parent name also in addition to these sequences. */
  var seq_div = document.querySelector(`.data-container[id="${sequence_id}"]`);
  var subfield_div = seq_div.querySelector(`.data-item[id="${subfield_sequence}"]`);


  /* Short circuit the logic so that we don't waste anytime serving variables and typedefs. */
  if (type != 'headers' && type != 'structs') {
    return;
  }

  unique_identifier = [];
  switch (subfield_div.querySelectorAll("span").length) {
    case 1:
      /* It makes no sense to actually remove typedefs entry by entry... 
         We should disable subfield variable deletions for typedefs. */
      break;
    case 2:
      /* We should be only removing headers and structs entries.  */
      unique_identifier = ['name', subfield_div.querySelectorAll("span")[1].innerText.trim()];
      break;
    case 3:
      /* It makes no sense to actually remove variables entry by entry... 
         We should disable subfield variable deletions for variables. */
      break;
  }

  subfield_div.remove();
  console.log(unique_identifier);
  /* find the unique identify in global_init_header_page_data, and delete the thing haha. */
  for (let doc in global_init_header_page_data[type]) {
    if (global_init_header_page_data[type][doc]["name"] == name) {
      for (let index in global_init_header_page_data[type][doc]["fields"]) {
        if (global_init_header_page_data[type][doc]["fields"][index][unique_identifier[0]] == unique_identifier[1]) {
          global_init_header_page_data[type][doc]["fields"].splice(index, 1);
          break;
        }
      }
    }
  }

  /* Regenerate existing dropdown menus, if there is any out there. */
  state_extraction_targets = updateStateExtractionTarget();
  state_condition_targets = updateStateConditionTarget();

  /* Nuke all existing dropdown menu items, if there is any out there. */
  /* Notice, find fields in headers that are of struct field type name. */
  for (let doc in global_init_header_page_data["structs"]) {
    console.log(global_init_header_page_data["structs"][doc]);
    if (global_init_header_page_data["structs"][doc]["name"] == "headers") {
      for (let index in global_init_header_page_data["structs"][doc]["content"]) {
        console.log(global_init_header_page_data["structs"][doc]["content"], global_init_header_page_data["structs"][doc]["content"][index]["type"] == name)
        if (global_init_header_page_data["structs"][doc]["content"][index]["type"] == name) {
          nukeButtonsByInnerText(`.${global_init_header_page_data["structs"][doc]["content"][index]["name"]}.${unique_identifier[1]}`);
        }
      }
    }
  }
}

function editDataItem(sequence_id, subfield_sequence, name, type) {
  console.log("editDataItem is here!, of type: ", sequence_id, subfield_sequence, name, type);
  var seq_div = document.querySelector(`.data-container[id="${sequence_id}"]`);
  var subfield_div = seq_div.querySelector(`.data-item[id="${subfield_sequence}"]`);
  // Extract all textual components into a formatted string and display that string in a text box.
  var divs_under_subfield = subfield_div.children;
  var subfields = [];
  divs_under_subfield[divs_under_subfield.length - 1].children[0].setAttribute('class', 'fa-solid fa-check fa-lg');
  divs_under_subfield[divs_under_subfield.length - 1].setAttribute('onclick', `reformulateDataItem(${sequence_id}, ${subfield_sequence}, '${name}', '${type}', null)`);
  var string = "";
  while (divs_under_subfield.length > 2) {
    string += divs_under_subfield[0].innerHTML;
    subfields.push(divs_under_subfield[0].innerHTML);
    string += " ";
    divs_under_subfield[0].remove();
  }
  console.log(subfield_div);
  var cached_html = subfield_div.innerHTML;
  var text_bar = `<input id = "i-${sequence_id}-${subfield_sequence}" type="text" value="${string}">\n`;

  subfield_div.innerHTML = text_bar + cached_html;
  subfield_div.innerHTML = subfield_div.innerHTML.replace(/null/g, `'${string}'`);
  console.log("subfield_div.innerHTML: ", subfield_div.innerHTML);

}

function reformulateDataItem(sequence_id, subfield_sequence, name, type, args = null) {
  console.log("reformulateDataItem is here!: ", sequence_id, subfield_sequence, name, type, args);
  var seq_div = document.querySelector(`.data-container[id="${sequence_id}"]`);
  var subfield_div = seq_div.querySelector(`.data-item[id="${subfield_sequence}"]`);
  var input_element = document.querySelector(`input#i-${sequence_id}-${subfield_sequence}`);
  var divs_under_subfield = subfield_div.children;
  old_value = args
  old_fields = old_value.replace(/\s+/g, ' ').trim().split(" ");
  input_value = input_element.value;
  input_fields = input_value.replace(/\s+/g, ' ').trim().split(" ");
  returned_div = null;
  unique_identifier = null;
  console.log(old_fields, input_fields);
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
  divs_under_subfield[divs_under_subfield.length - 1].setAttribute('onclick', `editDataItem(${sequence_id}, ${subfield_sequence}, '${name}', '${type}')`);

  console.log(subfield_div, subfield_div.querySelectorAll("span").length);
  /* TODO: Sync up the global dictionary */
  console.log(subfield_div.querySelectorAll("span").length);
  switch (subfield_div.querySelectorAll("span").length) {
    case 1:
      /* typedefs only */
      new_value = subfield_div.querySelectorAll("span")[0].innerText.trim().slice(4, -1);
      /* dive into the dictionary and change */
      for (let doc in global_init_header_page_data["typedefs"]) {
        if (global_init_header_page_data["typedefs"][doc]["name"] == name) {
          console.log("case 1 typedefs: found it");
          global_init_header_page_data["typedefs"][doc]["bit"] = parseInt(new_value);
        }
      }
      unique_identifier = old_fields[0];
      break;
    case 2:
      /* TODO: fix this thing to be subfields. */
      /* vars, headers, and structs */
      new_type = subfield_div.querySelectorAll("span")[0].innerText.trim();
      new_value = subfield_div.querySelectorAll("span")[1].innerText.trim();
      console.log(type, new_type, new_value);
      if (type == 'vars') {
        for (let doc in global_init_header_page_data["vars"]) {
          if (global_init_header_page_data["vars"][doc]["name"] == name) {
            console.log("case 2 vars: found it");
            global_init_header_page_data["vars"][doc]["type"] = new_type;
            global_init_header_page_data["vars"][doc]["value"] = new_value;
            // This is specifically designed for the case const switching.
            global_init_header_page_data["vars"][doc]["const"] = 0;
          }
        }
      } else if (type == 'headers') {
        for (let doc in global_init_header_page_data[type]) {
          if (global_init_header_page_data[type][doc]["name"] == name) {
            for (let index in global_init_header_page_data[type][doc]["fields"]) {
              console.log(global_init_header_page_data[type][doc]["fields"][index]["type"] == old_fields[0]);
              if (global_init_header_page_data[type][doc]["fields"][index]["type"] == old_fields[0] &&
                global_init_header_page_data[type][doc]["fields"][index]["name"] == old_fields[1]) {
                console.log("case 2 headers: found it");
                global_init_header_page_data[type][doc]["fields"][index]["type"] = input_fields[0];
                global_init_header_page_data[type][doc]["fields"][index]["name"] = input_fields[1];
              }
            }
          }
        }
      } else {
        // structs
        for (let doc in global_init_header_page_data[type]) {
          if (global_init_header_page_data[type][doc]["name"] == name) {
            for (let index in global_init_header_page_data[type][doc]["content"]) {
              if (global_init_header_page_data[type][doc]["content"][index]["type"] == old_fields[0] &&
                global_init_header_page_data[type][doc]["content"][index]["name"] == old_fields[1]) {
                global_init_header_page_data[type][doc]["content"][index]["type"] = input_fields[0];
                global_init_header_page_data[type][doc]["content"][index]["name"] = input_fields[1];
              }
            }
          }
        }
      }
      unique_identifier = old_fields[1];
      break;
    case 3:
      /* vars only */
      new_type = subfield_div.querySelectorAll("span")[1].innerText.trim();
      new_value = subfield_div.querySelectorAll("span")[2].innerText.trim();
      for (let doc in global_init_header_page_data["vars"]) {
        if (global_init_header_page_data["vars"][doc]["name"] == name) {
          console.log("case 3: found it");
          global_init_header_page_data["vars"][doc]["type"] = new_type;
          global_init_header_page_data["vars"][doc]["value"] = new_value;
          // This is specifically designed for the case const switching.
          global_init_header_page_data["vars"][doc]["const"] = 1;
        }
      }
      unique_identifier = old_fields[1];
  }

  /* Regenerate existing dropdown menus, if there is any out there. */
  state_extraction_targets = updateStateExtractionTarget();
  state_condition_targets = updateStateConditionTarget();

  injectLinkTargets_sync(init = false);
}

function reformulateDataName(sequence_id, type = null, name = null, subfield = null) {
  console.log("reformulate Data name");
  var input_element = document.querySelector(`input#dataname-${sequence_id}`);
  input_value = input_element.value.trim();
  returned_div = input_value + '\n';
  input_element.remove();

  var element = document.querySelector(`.data-container[id="${sequence_id}"]`);
  var name_div = element.querySelector(`.data-name`);
  name_div.innerHTML = returned_div + name_div.innerHTML;
  divs_under_subfield = name_div.children;

  divs_under_subfield[divs_under_subfield.length - 1].children[0].setAttribute('class', 'fa-solid fa-pen-to-square fa-lg');

  divs_under_subfield[divs_under_subfield.length - 1].setAttribute('onclick', `changeDataContainerState('edit', '${sequence_id}', '${type}', '${name}', '${subfield}')`);

  /* Edit name to dropdown menus. */
  console.log("edit", type, sequence_id, name, typeof subfield, input_value);
  syncDropdownContent("edit", type, sequence_id, name, subfield, input_value);
}

function nukeButtonsByInnerText(pattern) {
  const buttons = document.querySelectorAll("button.dropdown-content-item");
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i].innerText.includes(pattern)) {
      buttons[i].remove();
    }
  }
}

function replaceButtonsByInnerText(pattern, sequence_id, subfield_id, input_fields) {
  const buttons = document.querySelectorAll("button.dropdown-content-item");
  reformulated_text = input_fields[0] + " " + input_fields[1];
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i].innerText.includes(pattern)) {
      buttons[i].remove();
    }
  }
}

function addButtonsByInnerText(new_display_name, sequence_id) {
  const buttons = document.querySelectorAll("button.dropdown-content-item");
}

window.addEventListener("resize", reportWindowSize);
window.addEventListener("keydown", captureCode);
document.addEventListener("keydown", function (e) {
  // Ensure the event is from an input element you want to autocomplete
  if (e.target.className == 'autocompleteInput') {
    if (e.key == 'Tab' && e.target.dataset.suggestedWord && e.target.value.trim() != e.target.dataset.suggestedWord) {
      e.preventDefault();
      splitValue = e.target.value.split(' ');
      console.log(e.target.value, splitValue[splitValue.length - 1], e.target.dataset.suggestedWord);
      e.target.value = replaceLastOccurrence(e.target.value, splitValue[splitValue.length - 1], e.target.dataset.suggestedWord);
      console.log("target value", e.target.value);
    }
  }
});
window.addEventListener("contextmenu", injectLinkTargets_sync(false));

/***********************************Misc functions****************************/
function addActionModuleStatements(node_id) {
  if (highest_node_sequence[node_id] > 3) {
    return;
  }
  /* TODO: Add Module Statements with syntax highlighting and auto_complete variable names. */
  actions_page_items = document.querySelector(".actions-page-items");
  matches = actions_page_items.querySelectorAll(`#${node_id}`);
  node_display_content = matches[0].childNodes[1]
  const newDiv = document.createElement("div");
  newDiv.classList.add("module-element");
  newDiv.setAttribute(
    "id",
    `statement-${node_id}-${highest_node_sequence[node_id]}`
  );
  newDiv.innerHTML =
    STATEMENTS["action"](node_id, highest_node_sequence[node_id]) + "<br>";
  /* increments node_sequence to prevent collisions. */
  highest_node_sequence[node_id] += 1;
  /* Append the new div as a child of the parent div. */
  node_display_content.appendChild(newDiv);

}
async function addStateModuleStatements(node_id) {
  /*** Get number of current statements ***/
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

function addActionModule() {
  raw_html_string = `<div id="node-${highest_headers_page_variable_sequence}" class="drawflow-node"
                      style="width: 400px; min-height: 200px; border-radius: 10px; background: #DB3A34; align-items: baseline;">
                      <div class="drawflow_content_node" style="display: flex; flex-direction: column;">
                        <div class="module-element">
                          <p style="justify-content: center; float:left; margin: auto;"> Action </p>
                          <p style="justify-content: center; float:left; margin: auto;"> <input id="action-input-field"
                              placeholder="Action name" style="font-family:Courier, monospace; background: transparent;"> </p>
                          <p style="justify-content: center; float:right; margin: auto;">
                            <button class="btn" onclick="addModuleStatements('node-${highest_headers_page_variable_sequence}', 'action')">
                              <i class="fa-sharp fa-solid fa-circle-plus fa-lg" style="color: #1f2551;"></i>
                            </button>
                          </p>
                        </div>
                      </div>
                    </div>`
  new_html_element = document.createElement("div");
  new_html_element.innerHTML = raw_html_string;
  document.querySelector(`.actions-page-items`).appendChild(new_html_element);
  highest_headers_page_variable_sequence += 1;
}

function expandActionCode(node_id, sequence_id) {
  /* toggle on blur, and bring up the code block */
  document.querySelector(`.blur-filter.${node_id}-${sequence_id}`).style.display = 'block';
  console.log(document.querySelector(`.blur-filter.${node_id}-${sequence_id}`));
  document.querySelector(`#statement-${node_id}-${sequence_id}.module-element .CodeMirror.cm-s-default`).style.display = 'block';
  document.getElementById(`action-code-hide-${node_id}-${sequence_id}`).style.display = 'flex';
  /* Keep code blocks un-blurred */
  return;
}

function hideActionCode(node_id, sequence_id) {
  /* Do the reverse of expandActionCode */
  /* toggle on blur, and bring up the code block */
  document.querySelector(`.blur-filter.${node_id}-${sequence_id}`).style.display = 'none';
  document.querySelector(`#statement-${node_id}-${sequence_id}.module-element .CodeMirror.cm-s-default`).style.display = 'none';
  document.getElementById(`action-code-hide-${node_id}-${sequence_id}`).style.display = 'none';
  /* Keep code blocks un-blurred */
  return;
}

function extractActionCode(node_id, sequence_id) {
  /* Extract the inputs, outputs, and params from the code block */
  console.log(document.getElementById(`code ${node_id} ${sequence_id}`).value);
}