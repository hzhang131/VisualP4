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
let global_flow_editors = {};
let action_code_editor = {};
let local_variable_code_editor = {};
let global_slider = null;
let display_code = false;
let display_headers_page = false;
let display_actions_page = false;
let init_load = true;
let types = ["vars", "structs", "typedefs", "headers"];
let global_source_workspace = "parser";
let workspace_status_tracker_class_list = [
  "module-element",
  "dropdown-content-item",
];
let workspace_transition_dict = {
  parser: ["Begin", "VerifyChecksum", "begin", "verify-checksum"],
  "verify-checksum": ["Parser", "Ingress", "parser", "ingress"],
  ingress: ["VerifyChecksum", "Egress", "verify-checksum", "egress"],
  egress: ["Ingress", "ComputeChecksum", "ingress", "compute-checksum"],
  "compute-checksum": ["Egress", "Deparser", "egress", "deparser"],
  deparser: ["ComputeChecksum", "End", "compute-checksum", "end"],
};
let html_begin = `<p style="text-align:center; font-family:Courier, monospace;">
                    <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg" style = "top: 24%; left: 10%;">
                        <image href="https://upload.wikimedia.org/wikipedia/commons/7/7e/Diamond_warning_sign.svg" width="40" height="40"/>
                    </svg>
                    BEGIN
                  </p>`;
let html_stop = `<p style="text-align:center; font-family:Courier, monospace;">
                    <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg" style = "top: 24%; left: 10%;">
                      <image href="https://upload.wikimedia.org/wikipedia/commons/c/c0/MUTCD_R1-1.svg" width="40" height="40"/>
                    </svg>
                    STOP
                  </p>`;

/* 
  autoCompleteData sources keywords from the following sources:
  1. global_init_header_page_data
  2. global_init_action_page_data
  3. There might be more, but I don't remember. Let's add as we go.
*/
let keyMatchingConditions = ["lpm", "exact", "ternary", "range", "optional"];
let autoCompleteData = ["lpm", "exact", "ternary", "range", "optional"];
window.header_name_dict = [];
/* This thing is Javascript's equivalent of a defaultdict. */
let highest_node_sequence = new Proxy(
  {},
  {
    get: (target, name) => (name in target ? target[name] : 0),
  },
);

let highest_headers_page_variable_sequence = 0;
let highest_subfield_sequence_under_headers_page_variables = new Proxy(
  {},
  {
    get: (target, name) => (name in target ? target[name] : 0),
  },
);
let variable_hub_enabled_dict = new Proxy(
  {},
  {
    get: (target, name) => (name in target ? target[name] : false),
  },
);
let variable_hub_variable_count = new Proxy(
  {},
  {
    get: (target, name) => (name in target ? target[name] : 0),
  },
);

let ACTION_STYLE_OVERRIDE = [
  "min-width: 400px;",
  "min-height: 100px;",
  "border-radius: 10px;",
  "background: #DB3A34; align-items: baseline;",
];
let STATE_STYLE_OVERRIDE = [
  "min-width: 400px;",
  "min-height: 100px;",
  "border-radius: 10px;",
  "background: #DDCAD9; align-items: baseline;",
];
let TABLE_STYLE_OVERRIDE = [
  "min-width: 400px;",
  "min-height: 100px;",
  "border-radius: 10px;",
  "background: #6A5B6E; align-items: baseline;",
];
let STYLE_OVERRIDE = {
  action: ACTION_STYLE_OVERRIDE,
  state: STATE_STYLE_OVERRIDE,
  table: TABLE_STYLE_OVERRIDE,
};
/* Do some action style surgery */
let ACTION_HTMLCONTENT_FIELDS = function (node_id) {
  return `<div class="module-element" id="module-element-top-bar-${global_source_workspace}-${node_id}">
            <p style="flex: 1; display: flex; align-items: center; justify-content: center; margin: 0; font-size: 18px; font-weight: bold;">Action</p>
            <div style="flex: 2; display: flex; align-items: center; justify-content: center;">
                <input 
                    id="action-input-field-workspace-${global_source_workspace}-${node_id}" 
                    placeholder="Action name" 
                    style="width: 80%; padding: 5px; background: transparent; border: 1px solid rgba(255,255,255,0.2); border-radius: 5px; font-size: 18px; font-family: Courier, monospace; outline: none; color: #eee; transition: border-color 0.3s;"
                    onfocus="this.style.borderColor='rgba(255,255,255,0.5)';"
                    onblur="this.style.borderColor='rgba(255,255,255,0.2)';"
                >
            </div>
          </div>`;
};

let STATE_HTMLCONTENT_FIELDS = function (node_id) {
  return `<div class = "module-element" id = "module-element-top-bar-${global_source_workspace}-${node_id}">
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
  return `<div class = "module-element" id = "module-element-top-bar-${global_source_workspace}-${node_id}">
            <p style="justify-content: center; float:left; margin: auto; color: #c8c8c8; font-size: 20px;"> Table </p>
            <p style="justify-content: center; float:left; margin: auto;"> <input id = "table-input-field" placeholder="Table name" style="font-family:Courier, monospace; background: transparent; color: #b8b8b8; font-size: 20px;"> </input> </p>
          </div>
          <div class="module-element" id="aux-module-element-top-bar-${global_source_workspace}-${node_id}-size" style = "padding: 5px 10px; background-color: gold; border-radius: 5px;">
            <span class="size-label" style = "color: #282828; font-size: 20px;"> Size </span>
            <div class="size-illustration" id="aux-module-element-top-bar-${global_source_workspace}-${node_id}-size-illustration">
                <div class="battery-container">
                  <div class="battery-level-container" id="battery-level-${global_source_workspace}-${node_id}"></div>
                </div>
            </div>
            <span class="input-container">
              <input class="size-input" type="text" placeholder="" oninput="sizeInputHandler(this, '${global_source_workspace}', '${node_id}')"/>
            </span>
          </div>
          <div class = "module-element" id = "aux-module-element-top-bar-${global_source_workspace}-${node_id}-keys" style = "padding: 5px 10px; background-color: gold; border-radius: 5px; display: flex; flex-direction: column;">
            <div class = "table-key-header-container" id = "table-key-header-container-${global_source_workspace}-${node_id}">
              <span class="size-label" style = "color: #282828; font-size: 20px;"> Keys </span>
            </div>
            <div class = "table-key-pad-container" id = "table-key-pad-container-${global_source_workspace}-${node_id}" onclick = "addTableElements(this, '${global_source_workspace}', '${node_id}', 'Keys')">
            </div>
          </div>
          <div class = "module-element" id = "aux-module-element-top-bar-${global_source_workspace}-${node_id}-actions" style = "padding: 5px 10px; background-color: gold; border-radius: 5px; display: flex; flex-direction: column;">
            <div class = "table-action-header-container" id = "table-action-header-container-${global_source_workspace}-${node_id}">
              <span class="size-label" style = "color: #282828; font-size: 20px;"> Actions </span>
            </div>
            <div class = "table-action-pad-container" id = "table-action-pad-container-${global_source_workspace}-${node_id}" onclick = "addTableElements(this, '${global_source_workspace}', '${node_id}', 'Actions')">
            </div>
          </div>
          `;
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
                <div class="formatable-input-field" id = "formatable-input-field-${node_id}"> </div>
                </div>`;
    case 2:
      return `<div class="action-statement" id="${node_id} ${sequence_id}" onclick="expandActionCode('${node_id}', '${sequence_id}')">
                  Click here to show code
              </div>
              <div class="blur-filter ${node_id}-${sequence_id}"
                style="z-index: 15; backdrop-filter: blur(5px); position: fixed; display: none; width:100%;height: 100%; top: 0;left: 0;background-color: transparent;">
              </div>
              <textarea id="code ${node_id} ${sequence_id}" rows="40" style="caret-color: white; position: fixed; width: 50%; height: 50%; top: 25%; left: 25%;" autofocus></textarea>
              <button id="action-code-hide-${node_id}-${sequence_id}" style="position: fixed; display: none; z-index: 20; top: 25%; right: 20%; background-color: transparent; height: 3%; width: 3%; justify-content: center; align-items: center;" 
                      onclick="hideActionCode('${node_id}', '${sequence_id}'); populateActionModuleByCode('${node_id}');"> 
              <i class="fa fa-times-circle" style="position:relative;font-size:24px;color:red"></i>
              </button>
              `;
    default:
      return "";
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
            <button class="btn" onclick="dropdownDivRemove('${node_id}', '${sequence_id}', 'state')"> 
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
  vars: InjectVars,
  typedefs: InjectTypedefs,
  structs: InjectStructs,
  headers: InjectHeaders,
};

let state_extraction_targets = null;
let state_condition_targets = null;
let raw_condition_html = null;

/* pdf reader controls. */
let pdfDoc = null,
  pageNum = 1,
  pageRendering = false,
  pageNumPending = null,
  scale = 1.5;
let canvas, ctx;

/******************************** Main Logic and functions *****************************/
window.addEventListener("DOMContentLoaded", function () {
  //This section loads up the code editor(s).
  let INIT_HEADER_PAGE_DATA = {};
  INIT_HEADER_PAGE_DATA["ABC"] = "abc";
  let INIT_ACTION_PAGE_DATA = {};
  var codeTextArea = document.getElementById("code");
  height = window.innerHeight;
  var minLines = Math.trunc((height * 0.8) / 15) + 3;
  var startingValue =
    "/**\nWelcome to the VisualP4 IDE!\nDevelopment Version: 2023.10.08\n**/";
  for (var i = 0; i < minLines; i++) {
    startingValue += "\n";
  }

  var editor = CodeMirror.fromTextArea(codeTextArea, {
    lineNumbers: true,
    tabSize: 2,
  });

  editor.setValue(startingValue);
  global_editor[current_selected_window] = editor;

  // Killswitch display_code
  adjustWorkspaceWidth();

  let add_module_button_text = document.querySelector(`span.add-module-text`);
  add_module_button_text.innerHTML = "Add State Module";

  // This part initializes the flowchart canvas.
  var example = document.getElementById("drawflow-parser");
  global_flow_editor = new Drawflow(example);
  global_flow_editor.start();

  var html_post = `<p style="text-align:center; font-family:Courier, monospace;">${workspace_transition_dict["parser"][1]}<i class="fa-solid fa-arrow-right fa-beat" style="margin-left: 8px;"></i></p>`;
  global_flow_editor.addNode(
    "New Node 1",
    0,
    1,
    40,
    400,
    `begin-sign`,
    {},
    html_begin,
  );
  global_flow_editor.addNode(
    "New Node 2",
    1,
    0,
    1500,
    400,
    "generic parser post",
    {},
    html_post,
  );
  // put the flowchart editor into a dictionary.
  global_flow_editors[global_source_workspace] = global_flow_editor;

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
      state_extraction_targets = inferStateExtractionTarget(
        INIT_HEADER_PAGE_DATA,
      );
      state_condition_targets = inferStateConditionTarget(
        INIT_HEADER_PAGE_DATA,
      );
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  injectLinkTargets_async().then((init_load = false));

  /* Load ActionPageData */
  ActionPageData(INIT_ACTION_PAGE_DATA)
    .then((INIT_ACTION_PAGE_DATA) => {
      // Automatically populate the action page with the data.
      console.log("INIT_ACTION_PAGE_DATA object:", INIT_ACTION_PAGE_DATA);
      populateActionPage(INIT_ACTION_PAGE_DATA);
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  /* Listen to action search bar submit events. */
  let action_search_bar = document.querySelector(".actions-page-search-bar");
  let action_search_bar_input = action_search_bar.querySelector("input");
  action_search_bar_input.addEventListener("input", function (event) {
    event.preventDefault();
    let search_term = action_search_bar_input.value;
    if (search_term == "") {
      enableAllActionModules();
    } else {
      searchActionPage(search_term);
    }
  });

  addWorkspaceTransitionButtonClickHandler("post", "parser", "verify-checksum");

  /* Observer to observe DOM changes. */
  const observer = new MutationObserver((mutationsList, observer) => {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (
            node.className instanceof SVGAnimatedString &&
            node.className.baseVal === "connection" &&
            global_source_workspace !== "parser"
          ) {
            node.addEventListener("dragover", (event) => {
              event.preventDefault();
            });
            node.addEventListener("drop", (event) => {
              console.log("Something is dropping on me!");
              // Create a new div, and then append it to the svg
              connection_id = node.className.baseVal.replace(/\s+/g, "-");
              outerdiv = attachSVGDisplayBox(connection_id);
              let first_child = outerdiv.querySelector(":first-child");
              const droppedData = event.dataTransfer.getData("text/plain");
              first_child.textContent = droppedData;
              textSVGNode = node.parentElement.parentElement.querySelector(
                `div.${outerdiv.className}`,
              );
              if (!textSVGNode) {
                node.parentElement.parentElement.appendChild(outerdiv);
                UpdateConditionBoxLocation(
                  global_flow_editors[global_source_workspace].zoom,
                );
              } else if (
                textSVGNode.querySelector(`[class$="head"]`) &&
                textSVGNode.querySelector(`[class$="head"]`).innerHTML !==
                  droppedData
              ) {
                textSVGNode.querySelector(`[class$="head"]`).innerHTML =
                  droppedData;
              }
            });
          }
          // Override click default behavior for the non-parser workspaces.
          if (
            node.className == "condition-selector" &&
            global_source_workspace != "parser"
          ) {
            node.addEventListener("click", (event) => {
              event.preventDefault();
            });
          }
          if (workspace_status_tracker_class_list.includes(node.className)) {
            // Update status light  to yellow --> In progress
            if (
              this.document.querySelector(
                `div#${global_source_workspace}-status-circle-lime`,
              ) != null
            ) {
              this.document.querySelector(
                `div#${global_source_workspace}-status-circle-lime`,
              ).style.display = "none";
              this.document.querySelector(
                `div#${global_source_workspace}-status-circle-yellow`,
              ).style.display = "inline-block";
              this.document.querySelector(
                `div#${global_source_workspace}-status-circle-red`,
              ).style.display = "none";
              this.document.querySelector(
                `div#${global_source_workspace}-status-circle-blue`,
              ).style.display = "none";
            }
          }
          // Add mutation event listener to the new action node.
          if (
            node.className == "module-element" &&
            node.id.includes("module-element-top-bar") &&
            node.textContent.includes("Action") &&
            !node.textContent.includes("Actions")
          ) {
            // Do something hehe
            console.log(document.querySelector(`div.actions-page-items`));
            let node_parent = node.parentElement;
            node.addEventListener("input", function (e) {
              var display = false;
              // Look for all actions on the action page and try to find a match.
              for (
                let index = 0;
                index <
                document.querySelectorAll(`input#action-input-field`).length;
                index++
              ) {
                element = document.querySelectorAll(`input#action-input-field`)[
                  index
                ];
                if (element.value.trim() == e.target.value) {
                  console.log(node);
                  node.dataset.matchFound = true;
                  // Match found. Extract the inputs of this action.
                  action_match_head =
                    element.parentElement.parentElement.parentElement;
                  inputs = action_match_head.querySelectorAll(
                    `div.formatable-input-field .input_argument-line`,
                  );
                  var list_of_inputs = [];
                  inputs.forEach((input) => {
                    input.querySelectorAll("span").forEach((elem) => {
                      list_of_inputs.push(elem.textContent);
                    });
                  });
                  console.log(list_of_inputs);
                  for (let i = 0; i < list_of_inputs.length; i = i + 2) {
                    let type = list_of_inputs[i];
                    let arg = list_of_inputs[i + 1];
                    new_div = document.createElement("div");
                    new_div.className = "module-element dropbox";
                    new_div.id = `module-${node.id}-${type}-${arg}`;
                    new_div.innerHTML = `${type} ${arg}`;
                    new_div.style.fontSize = "20px";
                    // This is a long and a messy onclick function. I am sorry.
                    new_div.onclick = function () {
                      const currentText = this.textContent;
                      const inputElement = document.createElement("input");
                      if (this.className.includes("complete-dropbox")) {
                        this.className = this.className.replace(
                          "complete-dropbox",
                          "dropbox",
                        );
                      }
                      inputElement.type = "text";
                      inputElement.value = currentText;
                      const computedStyle = getComputedStyle(this);
                      inputElement.style.width = computedStyle.width;
                      inputElement.style.height = computedStyle.height;
                      inputElement.style.fontSize = "20px";
                      inputElement.style.backgroundColor = "transparent";
                      inputElement.style.border = "none";
                      inputElement.style.outline = "none";
                      this.innerHTML = "";
                      this.appendChild(inputElement);
                      inputElement.focus();
                      inputElement.select();
                      inputElement.addEventListener("blur", revertToDiv);
                      inputElement.addEventListener("keydown", function (e) {
                        if (e.key === "Enter") {
                          revertToDiv.call(this);
                        }
                      });
                      function revertToDiv() {
                        this.removeEventListener("blur", revertToDiv);
                        const newText = this.value;
                        const parentDiv = this.parentNode;

                        // Create a new text node
                        const textNode = document.createTextNode(newText);
                        parentDiv.replaceChild(textNode, this);

                        // Update class and event handlers as before
                        parentDiv.className =
                          "module-element complete-dropbox data-is-set";
                        parentDiv.onclick = this.onclick;
                      }
                    };

                    /* Dragover event when variable hub variables drags over individual elements. */
                    new_div.addEventListener("dragover", function (event) {
                      event.preventDefault();
                      this.classList.add("hovering");
                      if (this.className.includes("complete-dropbox")) {
                        this.className = this.className.replace(
                          "complete-dropbox",
                          "dropbox",
                        );
                      }
                    });

                    // Remove the CSS class when drag leaves the element
                    new_div.addEventListener("dragleave", function (event) {
                      event.preventDefault();
                      this.classList.remove("hovering");
                      if (
                        !this.className.includes("data-is-set") &&
                        this.className.includes("dropbox")
                      ) {
                        this.className = this.className.replace(
                          "dropbox",
                          "complete-dropbox",
                        );
                      }
                    });

                    /* After dragover, we modify the content on that stuff. */
                    new_div.addEventListener("drop", function (event) {
                      event.preventDefault();
                      if (this.className.includes("hovering")) {
                        this.classList.remove("hovering");
                      }
                      const droppedData =
                        event.dataTransfer.getData("text/plain");
                      this.innerHTML = droppedData;
                      if (this.className.includes("dropbox")) {
                        this.className = this.className.replace(
                          "dropbox",
                          "complete-dropbox",
                        );
                      }
                    });
                    node_parent.appendChild(new_div);
                  }
                  display = true;
                  break;
                } else {
                  node.dataset.matchFound = false;
                }
              }
              if (
                display == false &&
                node_parent.querySelectorAll(`div[id^="module-${node.id}-"]`)
                  .length > 0
              ) {
                node_parent
                  .querySelectorAll(`div[id^="module-${node.id}-"]`)
                  .forEach((elem) => {
                    elem.remove();
                  });
              }
            });
          }
          if (
            node.childNodes[0] &&
            node.childNodes[0].className == "action-statement"
          ) {
            // Add event listener once the code statement is added
            if (
              node.childNodes[4] &&
              node.childNodes[4].id.slice(0, 4) == "code"
            ) {
              codeTextArea = node.childNodes[4];
              editor = CodeMirror.fromTextArea(codeTextArea, {
                lineNumbers: false,
                tabSize: 2,
              });
              action_code_editor[node.id] = editor;
            }

            // Add event listener to the highlighted input text
            // Wait for the highlighted input text to be added first
            ((current_node) => {
              waitForElement(() =>
                node.querySelectorAll(`span.highlighted-type`),
              ).then(() => {
                attachHighlightEventListener(current_node);
              });
            })(node);

            // Add event listener to the new input
            node.addEventListener("input", function (e) {
              // Ensure the event is from an input element you want to autocomplete
              if (e.target.className === "autocompleteInput") {
                // I'm using a class name to identify relevant input elements
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
                    break;
                  }
                }

                let span = node.querySelectorAll("span")[0];
                let span_id = span.id;
                let span_id_split = span_id.split(" ");
                let node_id = span_id_split[1];
                let sequence_id = span_id_split[2];
                console.log(node_id, sequence_id);
                // Inside your input event listener:
                for (let word of autoCompleteData) {
                  if (word.startsWith(inputValue)) {
                    // Only set the suggestion part to the span (subtracting what the user already typed)
                    span.textContent =
                      "↹ " + inputValue + word.substring(inputValue.length);
                    break;
                  } else {
                    span.textContent = ""; // If no match, show only the user's input
                  }
                }
              }
            });
            node.addEventListener("input", function (event) {
              if (
                event.target.tagName.toLowerCase() === "textarea" &&
                event.target.className.toLowerCase() == "autocompleteinput"
              ) {
                const textarea = event.target;
                if (textarea.selectionStart % 38 == 0) {
                  if (!textarea.style.height) {
                    textarea.style.height =
                      64 +
                      parseInt(
                        window
                          .getComputedStyle(textarea, null)
                          .getPropertyValue("line-height")
                          .slice(0, -2),
                      ) +
                      "px";
                  } else {
                    textarea.style.height =
                      64 +
                      parseInt(
                        window
                          .getComputedStyle(textarea, null)
                          .getPropertyValue("line-height")
                          .slice(0, -2),
                      ) *
                        parseInt(textarea.selectionStart / 38) +
                      "px";
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
    subtree: true,
  };

  observer.observe(document.body, config);

  const buttons = document.querySelectorAll(".filterable-button");
  const maxButtons = 5;

  for (let i = 0; i < buttons.length; i++) {
    if (i >= maxButtons) {
      buttons[i].style.display = "none"; // Hide buttons beyond the sixth one
    }
  }

  document
    .getElementById("searchInput")
    .addEventListener("input", function (e) {
      let searchValue = e.target.value.toLowerCase();
      let buttons = document.querySelectorAll(".filterable-button");
      let buttonCount = 0;
      buttons.forEach((button) => {
        if (
          button.innerText.toLowerCase().includes(searchValue) &&
          buttonCount < maxButtons
        ) {
          button.style.display = ""; // Show button
          buttonCount++;
        } else {
          button.style.display = "none"; // Hide button
        }

        // If no buttons are visible, display the "Such empty..." message
        const emptyMessageContainer = document.querySelector(".empty-message");

        if (buttonCount === 0) {
          emptyMessageContainer.innerHTML = `
                <div style="text-align: center; border: 2px dashed #aaa; padding: 10px 20px; border-radius: 10px;">
                    <p style="color: #999; font-weight: bold; font-size: 18px; margin: 0; padding: 0;">Such empty...</p>
                </div>`;
          emptyMessageContainer.style.display = "block"; // Display the message
        } else {
          emptyMessageContainer.style.display = "none"; // Hide the message
        }
      });
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

function createNewModule(type = null) {
  /* TODO: (Lower Priority) This function creates a new module and dump that module to a less cluttered area. */
  var html = `<p style="text-align:center; font-family:Courier, monospace;">Right click to select type</p>`;
  node_id = global_flow_editors[global_source_workspace].addNode(
    "New Node",
    1,
    1,
    100,
    300,
    `generic ${global_source_workspace}`,
    {},
    html,
  );
  current_node = `node-${node_id}`;
  switch (global_source_workspace) {
    /* Mocking the existing workflow that we have. Could be completely streamlined!! */
    case "parser":
      changeModuleType(current_node, "state");
      break;

    case "compute-checksum":
    case "verify-checksum":
    case "deparser":
      /* Default to action only for low activity controls */
      changeModuleType(current_node, "action");
      break;

    case "ingress":
    case "egress":
      /* Not implemented yet. */
      if (type) {
        changeModuleType(current_node, type);
      } else {
        /* Fall back to table */
        changeModuleType(current_node, "table");
      }
      break;

    default:
      throw new Error("Not implemented yet.");
  }
}

function zoomLevelAdjust() {
  global_flow_editors[global_source_workspace].zoom = global_slider.value;
  global_flow_editors[global_source_workspace].zoom_refresh();
  UpdateConditionBoxLocation(global_flow_editors[global_source_workspace].zoom);
}

function changeModuleType(node_id, type) {
  // matches = document.getElementById(node_id);
  matches = document.querySelector(
    `div#${node_id}.drawflow-node.generic.${global_source_workspace}`,
  );
  /* Modify the node id to prevent further collisions down the road. */
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
  /* Change the node_id to prevent potential collisions. */
  matches.childNodes[1].innerHTML = HTMLCONTENT_FIELDS[type](node_id);
  /* Change drawflow-content-node to flex and flex-direction: column for better visuability. */
  matches.childNodes[1].setAttribute(
    "style",
    "display: flex; flex-direction: column;",
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
    `${type}-${node_id}-${sequence_id}`,
  );
  // Match statement id here.
  lala = dropdown_button_info.querySelector(".dropdown .dropdown-item");
  lala.innerHTML = arg;
}

function dropdownContentItemConnectionHandler(id, category, arg) {
  // Place an id here.
  var query_id = id.replaceAll(" ", "-");
  var query_class_name = id.replaceAll(" ", ".");
  var toplevel_drawflow = document.querySelector(
    `.drawflow-child.parent-drawflow#drawflow-${global_source_workspace}`,
  );
  console.log(toplevel_drawflow);
  console.log(
    toplevel_drawflow.querySelectorAll(`div.side-by-side-div-${query_id}`)
      .length,
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
    console.log("line 738: ", query_id);
    outerdiv.classList.add(`side-by-side-div-${query_id}`);

    var div1 = document.createElement("div");
    var div2 = document.createElement("div");
    var div3 = document.createElement("div");
    var div4 = document.createElement("div");

    div1.classList.add(`side-by-side-div-${query_id}-switch-head`);
    div2.classList.add(`side-by-side-div-${query_id}-switch-target`);
    div3.classList.add(`side-by-side-div-${query_id}-field3`);
    div4.classList.add(`side-by-side-div-${query_id}-field4`);
    subdivs = [div1, div2, div3, div4];

    outerdiv.appendChild(div1);
    outerdiv.appendChild(div2);
    outerdiv.appendChild(div3);
    outerdiv.appendChild(div4);

    // Some style parameters. I know I am not allowed to do it here, but come on!
    outerdiv.style.backgroundColor = "#B5E6E9";
    outerdiv.style.border = "1px solid #aaa";
    outerdiv.style.width = "auto";
    outerdiv.style.height = "auto";
    outerdiv.style.padding = "5px 10px";
    outerdiv.style.display = "inline-flex";
    outerdiv.style.fontFamily =
      "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    outerdiv.style.fontSize = "14px";
    outerdiv.style.fontWeight = "normal";
    outerdiv.style.position = "absolute";
    outerdiv.style.borderRadius = "5px";
    outerdiv.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
    outerdiv.style.textAlign = "center";
    toplevel_drawflow.appendChild(outerdiv);
  }

  /* Update display content.*/
  current_side_by_side = toplevel_drawflow.querySelector(
    `div.side-by-side-div-${query_id}`,
  );
  category_level_div = current_side_by_side.querySelector(
    `div.side-by-side-div-${query_id}-${category}`,
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
  console.log("line 775, side by side location", top, left);
  // Scale everything by zoom level.
  UpdateConditionBoxLocation(global_flow_editors[global_source_workspace].zoom);
  /* On change, we also need to update new position in drawflow.js */
  // TODO: Every onclick requires updating data in a persistant data storage.
}

function dropdownDivRemove(node_id, sequence_id, type) {
  // Get an element from the div stack and remove it from the div stack.
  const element_to_remove = document.getElementById(
    `statement-${node_id}-${sequence_id}-${type}-${global_source_workspace}`,
  );
  element_to_remove.remove();
  // TODO: Every onclick requires updating data in a persistant data storage.
}

function CodeDisplaySetting() {
  // User Toggle to enable / disable the code block.
  // Disabling: hides code block and expands the width of main canvas.
  // Enabling: shows code block and shrinks the width of main canvas.
  // TODO: Dynamically retrieve current element id. For now, it is hardcoded.
  adjustWorkspaceWidth();
  display_code = !display_code;
}

function HeaderDisplaySetting() {
  document.querySelector(`button#${global_source_workspace}`).style.background =
    "linear-gradient(to bottom, #91c3e0, #609cb2)";
  document.querySelector(`button#actions-button`).style.background =
    "linear-gradient(to bottom, #91c3e0, #609cb2)";
  document.querySelector(`button#headers-button`).style.background =
    "linear-gradient(to bottom, #406a7e, #30505e)";

  const headersPage = document.querySelector(".headers-page");
  const actionsPage = document.querySelector(".actions-page");
  // User can toggle a headers page with this
  if (display_headers_page) {
    if (!display_actions_page) {
      actionsPage.classList.remove("show");
      display_actions_page = !display_actions_page;
      document.querySelector(`button#actions-button`).style.background =
        "linear-gradient(to bottom, #91c3e0, #609cb2)";
    }
    headersPage.classList.add("show");
  } else {
    headersPage.classList.remove("show");
    document.querySelector(
      `button#${global_source_workspace}`,
    ).style.background = "linear-gradient(to bottom, #406a7e, #30505e)";
    document.querySelector(`button#headers-button`).style.background =
      "linear-gradient(to bottom, #91c3e0, #609cb2)";
  }
  display_headers_page = !display_headers_page;
}

function ActionDisplaySetting() {
  document.querySelector(`button#${global_source_workspace}`).style.background =
    "linear-gradient(to bottom, #91c3e0, #609cb2)";
  document.querySelector(`button#headers-button`).style.background =
    "linear-gradient(to bottom, #91c3e0, #609cb2)";
  document.querySelector(`button#actions-button`).style.background =
    "linear-gradient(to bottom, #406a7e, #30505e)";

  const headersPage = document.querySelector(".headers-page");
  const actionsPage = document.querySelector(".actions-page");
  // User can toggle a headers page with this
  if (display_actions_page) {
    if (!display_headers_page) {
      headersPage.classList.remove("show");
      display_headers_page = !display_headers_page;
      document.querySelector(`button#headers-button`).style.background =
        "linear-gradient(to bottom, #91c3e0, #609cb2)";
    }
    actionsPage.classList.add("show");
  } else {
    actionsPage.classList.remove("show");
    document.querySelector(
      `button#${global_source_workspace}`,
    ).style.background = "linear-gradient(to bottom, #406a7e, #30505e)";
    document.querySelector(`button#actions-button`).style.background =
      "linear-gradient(to bottom, #91c3e0, #609cb2)";
  }
  display_actions_page = !display_actions_page;
}

function ActionPageData(initialData) {
  // Reads the initial header data stored in './APD/'
  const directoryPath = "./APD/";
  var actionPageData = {};

  return new Promise((resolve, reject) => {
    fetch(directoryPath)
      .then((response) => response.text())
      .then((actions) => {
        actions = JSON.parse(actions);
        console.log("actions:", actions);
        for (let action_index in actions) {
          for (let index = 0; index < actions[action_index].length; index++) {
            const FileObj = actions[action_index][index];
            const key = Object.keys(FileObj)[0];
            const value = Object.values(FileObj)[0];
            actionPageData[key] = {
              code: value,
              metadata: extractActionCore(value),
            };
            autoCompleteData.push(actionPageData[key]["metadata"]["name"]);
          }
        }
        console.log("Inside ActionPageData 1:", actionPageData);
      })
      .then(() => {
        resolve(actionPageData);
        console.log("Inside ActionPageData:", actionPageData);
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
            document.querySelector(
              `.headers-page-item#${file_name.slice(0, -5)}`,
            ),
            jsonData,
          );
          INIT_HEADER_PAGE_DATA[file_name.slice(0, -5)] = jsonData;
          console.log(
            "JSON data stored in INIT_HEADER_PAGE_DATA:",
            file_name.slice(0, -5),
          );
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
/**
 *           Cache these things, might be useful later.
 *           <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('delete', '')"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;"></i> </button>
 *           <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('modify', '')"> <i class="fa-solid fa-pen fa-lg" style="color: #1f2551;"></i> </button>
 */
function InjectVars(html_block, vars) {
  var tempHTML = ` <div style="position: relative; top: 0; left: 0; width: 100%; height: 40px; background-color: #B0A392; margin: 5px 0; border-radius: 5px; display: flex; align-items: center; justify-content: space-between; border: 2px solid #D5CABD;">
                      <!-- Variables text div -->
                      <div style="font-size: 18px; font-weight: 600; color: #333; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); margin-left: 10px;">Variables</div>
                      
                      <!-- Add New Variables div -->
                      <div class="add-icon" onclick="addHeaderPageItem('vars')" style="cursor: pointer; margin-right: 0px;">Add New Variables</div>
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
    highest_subfield_sequence_under_headers_page_variables[
      highest_headers_page_variable_sequence
    ] += 1;
    highest_headers_page_variable_sequence += 1;
  }

  html_block.innerHTML = tempHTML;
  highest_headers_page_variable_sequence += 1;
}

function InjectHeaders(html_block, headers) {
  var tempHTML = `<div style="position: relative; top: 0; left: 0; width: 100%; height: 40px; background-color: #B0A392; margin: 5px 0; border-radius: 5px; display: flex; align-items: center; justify-content: space-between; border: 2px solid #D5CABD;">
                    <!-- Variables text div -->
                    <div style="font-size: 18px; font-weight: 600; color: #333; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); margin-left: 10px;">Headers</div>
                    
                    <!-- Add New Variables div -->
                    <div class="add-icon" onclick="addHeaderPageItem('headers')" style="cursor: pointer; margin-right: 0px;">Add New Headers</div>
                  </div>`;

  for (let i = 0; i < headers.length; i++) {
    var item = headers[i];

    tempHTML += `
      <div class="data-container" id = "${highest_headers_page_variable_sequence}">
        <div class="data-name">
          ${item.name}
          <button class="btn" style="float:right; padding:0px; margin-right: 0px; top: -3px; position: relative;" onclick="changeDataContainerState('delete', '${highest_headers_page_variable_sequence}', 'headers', '${
            item.name
          }')"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;"></i> </button>
          <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('add', '${highest_headers_page_variable_sequence}', 'headers', '${
            item.name
          }')"> <i class="fa-solid fa-circle-plus fa-lg" style="color: #1f2551;"></i> </button>
          <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('edit', '${highest_headers_page_variable_sequence}', 'headers', '${
            item.name
          }')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
      </div>
        ${generateFieldsHTML(item.fields)}
      </div>
    `;
    highest_headers_page_variable_sequence += 1;
  }

  html_block.innerHTML = tempHTML;

  function generateFieldsHTML(fields) {
    var fieldsHTML = "";
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
      highest_subfield_sequence_under_headers_page_variables[
        highest_headers_page_variable_sequence
      ] += 1;
    }
    return fieldsHTML;
  }
  highest_headers_page_variable_sequence += 1;
}

function InjectStructs(html_block, structs) {
  var tempHTML = ` <div style="position: relative; top: 0; left: 0; width: 100%; height: 40px; background-color: #B0A392; margin: 5px 0; border-radius: 5px; display: flex; align-items: center; justify-content: space-between; border: 2px solid #D5CABD;">
                      <!-- Variables text div -->
                      <div style="font-size: 18px; font-weight: 600; color: #333; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); margin-left: 10px;">Structs</div>
                      
                      <!-- Add New Variables div -->
                      <div class="add-icon" onclick="addHeaderPageItem('structs')" style="cursor: pointer; margin-right: 0px;">Add New Structs</div>
                    </div>`;
  for (let i = 0; i < structs.length; i++) {
    var item = structs[i];
    tempHTML += `
      <div class="data-container" id = "${highest_headers_page_variable_sequence}">
        <div class="data-name">
            ${item.name}
            <button class="btn" style="float:right; padding:0px; margin-right: 0px; top: -3px; position: relative;" onclick="changeDataContainerState('delete', '${highest_headers_page_variable_sequence}', 'structs', '${
              item.name
            }')"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;"></i> </button>
            <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('add', '${highest_headers_page_variable_sequence}', 'structs', '${
              item.name
            }')"> <i class="fa-solid fa-circle-plus fa-lg" style="color: #1f2551;"></i> </button>
            <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('edit', '${highest_headers_page_variable_sequence}', 'structs', '${
              item.name
            }')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
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
      highest_subfield_sequence_under_headers_page_variables[
        highest_headers_page_variable_sequence
      ] += 1;
    }
    return contentHTML;
  }
}

function InjectTypedefs(html_block, typedefs) {
  var tempHTML = `<div style="position: relative; top: 0; left: 0; width: 100%; height: 40px; background-color: #B0A392; margin: 5px 0; border-radius: 5px; display: flex; align-items: center; justify-content: space-between; border: 2px solid #D5CABD;">
                    <!-- Variables text div -->
                    <div style="font-size: 18px; font-weight: 600; color: #333; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); margin-left: 10px;">Typedefs</div>
                    
                    <!-- Add New Variables div -->
                    <div class="add-icon" onclick="addHeaderPageItem('typedefs')" style="cursor: pointer; margin-right: 0px;">Add New Typedefs</div>
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
    highest_subfield_sequence_under_headers_page_variables[
      highest_headers_page_variable_sequence
    ] += 1;
    highest_headers_page_variable_sequence += 1;
  }
  html_block.innerHTML = tempHTML;
}

function addHeaderPageItem(type) {
  var selector = document.querySelector(`.headers-page-item#${type}`);
  /* To be replaced later. */
  var random_name_for_testing_only = Math.random().toString(36).slice(2, 7);
  switch (type) {
    case "headers":
      selector.innerHTML += `
                                          <div class="data-container" id = "${highest_headers_page_variable_sequence}">
                                            <div class="data-name">
                                                new header ${random_name_for_testing_only}
                                                <button class="btn" style="float:right; padding:0px; margin-right: 0px; top: -3px; position: relative;"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;" onclick="changeDataContainerState('delete', '${highest_headers_page_variable_sequence}', 'headers', '${random_name_for_testing_only}')"></i> </button>
                                                <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;"> <i class="fa-solid fa-circle-plus fa-lg" style="color: #1f2551;" onclick="changeDataContainerState('add', '${highest_headers_page_variable_sequence}', 'headers', '${random_name_for_testing_only}', 'Subfield Placeholder')"></i> </button>
                                                <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('edit', '${highest_headers_page_variable_sequence}', 'headers', '${random_name_for_testing_only}')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
                                            </div>
                                          `;
      break;
    case "typedefs":
      selector.innerHTML += `
                                            <div class="data-container" id = "${highest_headers_page_variable_sequence}">
                                              <div class="data-name">
                                                  new typedef ${random_name_for_testing_only}
                                                  <button class="btn" style="float:right; padding:0px; margin-right: 0px; top: -3px; position: relative;"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;" onclick="changeDataContainerState('delete', '${highest_headers_page_variable_sequence}', 'typedefs', '${random_name_for_testing_only}')"></i> </button>
                                                  <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;"> <i class="fa-solid fa-circle-plus fa-lg" style="color: #1f2551;" onclick="changeDataContainerState('add', '${highest_headers_page_variable_sequence}', 'typedefs', '${random_name_for_testing_only}', 'Subfield Placeholder')"></i> </button>
                                                  <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('edit', '${highest_headers_page_variable_sequence}', 'typedefs', '${random_name_for_testing_only}')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
                                              </div>
                                            `;
      break;
    case "structs":
      selector.innerHTML += ` 
                                            <div class="data-container" id = "${highest_headers_page_variable_sequence}">
                                            <div class="data-name">
                                                new struct ${random_name_for_testing_only}
                                                <button class="btn" style="float:right; padding:0px; margin-right: 0px; top: -3px; position: relative;"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;" onclick="changeDataContainerState('delete', '${highest_headers_page_variable_sequence}', 'structs', '${random_name_for_testing_only}')"></i> </button>
                                                <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;"> <i class="fa-solid fa-circle-plus fa-lg" style="color: #1f2551;" onclick="changeDataContainerState('add', '${highest_headers_page_variable_sequence}', 'structs', '${random_name_for_testing_only}', 'Subfield Placeholder')"></i> </button>
                                                <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('edit', '${highest_headers_page_variable_sequence}', 'structs', '${random_name_for_testing_only}')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
                                            </div>
                                          `;
      break;
    case "vars":
      selector.innerHTML += ` 
                                          <div class="data-container" id = "${highest_headers_page_variable_sequence}">
                                          <div class="data-name">
                                              new variable ${random_name_for_testing_only}
                                              <button class="btn" style="float:right; padding:0px; margin-right: 0px; top: -3px; position: relative;"> <i class="fa-solid fa-circle-xmark fa-lg" style="color: #1f2551;" onclick="changeDataContainerState('delete', '${highest_headers_page_variable_sequence}', 'vars', '${random_name_for_testing_only}')"></i> </button>
                                              <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;"> <i class="fa-solid fa-circle-plus fa-lg" style="color: #1f2551;" onclick="changeDataContainerState('add', '${highest_headers_page_variable_sequence}', 'vars', '${random_name_for_testing_only}', 'Subfield Placeholder')"></i> </button>
                                              <button class="btn" style="float:right; padding:0px; margin-right: 2px; top: -3px; position: relative;" onclick="changeDataContainerState('edit', '${highest_headers_page_variable_sequence}', 'vars', '${random_name_for_testing_only}')"> <i class="fa-solid fa-pen-to-square fa-lg" style="color: #1f2551;"></i> </button>
                                          </div>
                                        `;
      break;
  }
  console.log(
    "add",
    highest_headers_page_variable_sequence,
    type,
    random_name_for_testing_only,
  );
  changeDataContainerState(
    "add",
    highest_headers_page_variable_sequence,
    type,
    random_name_for_testing_only,
  );
  highest_headers_page_variable_sequence += 1;
}

/* Exactly the same one as the one in drawflow.js. 
   This function should be able to be cross-imported, but I don't know how :( */
function UpdateConditionBoxLocation(zoom_level) {
  var candidates = document.querySelectorAll('div[class^="side-by-side-div"]');

  var side_by_side_divs = Array.from(candidates).filter((div) => {
    let regex = new RegExp(`side-by-side-div-.*?-${global_source_workspace}`);
    return regex.test(div.className);
  });

  console.log("side_by_side_divs content", side_by_side_divs);
  var current_index = 0;
  for (
    current_index = 0;
    current_index < side_by_side_divs.length;
    current_index++
  ) {
    var child_divs_keyword_list = ["target", "head", "field3", "field4"];
    var child_div_classname = side_by_side_divs[current_index].className;
    var child_div_classname_chunks = child_div_classname.split("-");
    console.log(
      child_div_classname_chunks,
      child_div_classname_chunks[child_div_classname_chunks.length - 1],
    );
    if (
      !child_divs_keyword_list.includes(
        child_div_classname_chunks[child_div_classname_chunks.length - 1],
      )
    ) {
      // This indicates that this block is the block that we are looking for.
      // Get id, grab path, and update location.
      // slice name to match svg class.

      var svg_elements = document.querySelectorAll(`svg[class^="connection"]`);
      var svg_index = -1;
      for (svg_index = 0; svg_index < svg_elements.length; svg_index++) {
        console.log(
          "1195",
          svg_elements[svg_index].className.baseVal.replaceAll(" ", "-"),
        );
        console.log("1196", child_div_classname_chunks.slice(4).join("-"));
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

      if (path_pos_data.width == 0 && path_pos_data.height == 0) {
        // This is a hacky way to deal with the situation where the path is not rendered yet.
        return;
      }

      const coords = path_box
        .getAttribute("d")
        .trim()
        .split(" ")
        .filter((coord) => coord !== "M" && coord !== "C");
      const filtered_coords = coords.filter((value) => value.trim() !== "");
      // Extract the four points
      const point1 = {
        x: parseFloat(filtered_coords[0]),
        y: parseFloat(filtered_coords[1]),
      };
      const point2 = {
        x: parseFloat(filtered_coords[2]),
        y: parseFloat(filtered_coords[3]),
      };
      const point3 = {
        x: parseFloat(filtered_coords[4]),
        y: parseFloat(filtered_coords[5]),
      };
      const point4 = {
        x: parseFloat(filtered_coords[6]),
        y: parseFloat(filtered_coords[7]),
      };

      var near_horizontal_regions = findHorizontalRegions(
        point1,
        point2,
        point3,
        point4,
      );

      var centerX, centerY, width, height, left, top;
      if (near_horizontal_regions.length == 0) {
        centerX = path_pos_data.left + path_pos_data.width / 2; // Calculate the x-coordinate of the center
        centerY = path_pos_data.top + path_pos_data.height / 2; // Calculate the y-coordinate of the center

        width = side_by_side_divs[current_index].offsetWidth;
        height = side_by_side_divs[current_index].offsetHeight;

        left = centerX - width / 2; // Calculate the left position
        top = centerY - height / 2; // Calculate the top position
      } else {
        var near_horizontal_region_x =
          near_horizontal_regions[near_horizontal_regions.length - 1].x;
        var near_horizontal_region_y =
          near_horizontal_regions[near_horizontal_regions.length - 1].y;
        centerX =
          path_pos_data.left +
          path_pos_data.width / 2 +
          near_horizontal_region_x;
        centerY =
          path_pos_data.top +
          path_pos_data.height / 2 +
          near_horizontal_region_y;

        width = side_by_side_divs[current_index].offsetWidth;
        height = side_by_side_divs[current_index].offsetHeight;

        left = centerX - width / 2 + 30; // Calculate the left position
        top = centerY - height / 2; // Calculate the top position
      }
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
    extraction_targets.push(`hdr.${name}`);
    /* dive into all options under header `type` */
    for (let j = 0; j < INIT_HEADER_PAGE_DATA["headers"].length; j++) {
      if (type == INIT_HEADER_PAGE_DATA["headers"][j]["name"]) {
        for (
          let k = 0;
          k < INIT_HEADER_PAGE_DATA["headers"][j]["fields"].length;
          k++
        ) {
          /* TODO: change it later!!!!! We should not hardcode hdr to extraction targets. */
          extraction_targets.push(
            `hdr.${name}.${INIT_HEADER_PAGE_DATA["headers"][j]["fields"][k]["name"]}`,
          );
          autoCompleteData.push(
            `hdr.${name}.${INIT_HEADER_PAGE_DATA["headers"][j]["fields"][k]["name"]}`,
          );
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
    extraction_targets.push(`hdr.${name}`);
    /* dive into all options under header `type` */
    for (let j = 0; j < global_init_header_page_data["headers"].length; j++) {
      console.log(
        type,
        global_init_header_page_data["headers"][j]["name"],
        type == global_init_header_page_data["headers"][j]["name"],
      );
      if (type == global_init_header_page_data["headers"][j]["name"]) {
        for (
          let k = 0;
          k < global_init_header_page_data["headers"][j]["fields"].length;
          k++
        ) {
          /* TODO: change it later!!!!! We should not hardcode hdr to extraction targets.*/
          // console.log(`hdr.${name}.${global_init_header_page_data["headers"][j]["fields"][k]["name"]}`);
          extraction_targets.push(
            `hdr.${name}.${global_init_header_page_data["headers"][j]["fields"][k]["name"]}`,
          );
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
      if (
        Array.isArray(state_extraction_targets) &&
        Array.isArray(state_condition_targets)
      ) {
        clearInterval(checkVariableType);
        resolve();
      }
    }, 100);
  });
}

function resolveConditionHTML() {
  return new Promise((resolve, reject) => {
    const checkVariableType = setInterval(() => {
      const dropdownElements = document.querySelectorAll(
        ".condition-selector .dropdown",
      );
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
  }).catch(() => {
    // Do nothing if the promise is rejected
  });
}

function replaceLastOccurrence(str, find, replaceWith) {
  let lastIndex = str.lastIndexOf(find);

  if (lastIndex === -1) {
    return str; // The substring was not found, return original string
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
  console.log(
    "inside injectLinkTargets",
    init,
    raw_condition_html,
    state_condition_targets,
    state_extraction_targets,
  );

  if (state_condition_targets && state_extraction_targets) {
    /* Extract Link Target Menus */
    if (init == true && raw_condition_html) {
      /* TODO: I suspect this function is not working properly, no action needs to be taken right now...*/
      temp_menu_html = "";
      temp_target_html = "";
      /* Extract ID */
      var connection_id =
        raw_condition_html[0].querySelector(".dropdown-content").id;
      console.log("line 1132, connection_id", connection_id);
      /* Inject menu functions. */
      for (let i = 0; i < state_extraction_targets.length; i++) {
        temp_menu_html += `<button class="dropdown-content-item" onclick = 'dropdownContentItemConnectionHandler("${connection_id.slice(
          0,
          -9,
        )}", "switch-head", "${
          state_extraction_targets[i]
        }: ")' style = "z-index: 2;">${state_extraction_targets[i]}</button>\n`;
      }
      /* Inject Conditions */
      for (let i = 0; i < state_condition_targets.length; i++) {
        temp_target_html += `<button class="dropdown-content-item" onclick = 'dropdownContentItemConnectionHandler("${connection_id.slice(
          0,
          -9,
        )}", "switch-target", "${
          state_condition_targets[i]
        }")' style = "z-index: 2;">${state_condition_targets[i]}</button>\n`;
      }

      raw_condition_html[0].querySelector(".dropdown-content").innerHTML =
        temp_menu_html;
      raw_condition_html[1].querySelector(".dropdown-content").innerHTML =
        temp_target_html;
    } else {
      /* Update dropdown extraction targets */
      dropdownElements = document.querySelectorAll(
        'div.dropdown[id^="target-node-"]',
      );
      for (let i = 0; i < dropdownElements.length; i++) {
        dropdownElement = dropdownElements[i];
        id = dropdownElement.id;
        node_id = id.split("-")[2];
        field_id = 0;
        dropdownElementContent =
          dropdownElement.querySelector(".dropdown-content");
        tempHTML = "";
        for (let i = 0; i < state_extraction_targets.length; i++) {
          tempHTML += `<button class="dropdown-content-item" onclick = 'dropdownContentItemConnectionHandler("node-${node_id}", "0", "target", "${state_extraction_targets[i]}: ")' style = "z-index: 2;">${state_extraction_targets[i]}</button>\n`;
        }
        dropdownElementContent.innerHTML = tempHTML;
      }
      /* Update dropdown condition targets */
      const category_dropboxes = Array.from(
        document.querySelectorAll('[id$="-category"]'),
      ).filter(
        (el) =>
          el.id.startsWith("connection") &&
          el.classList.contains("dropdown-content"),
      );
      const target_dropboxes = Array.from(
        document.querySelectorAll('[id$="-target"]'),
      ).filter(
        (el) =>
          el.id.startsWith("connection") &&
          el.classList.contains("dropdown-content"),
      );

      /* Populate category */
      category_dropboxes.forEach((category_dropdown) => {
        connection_id = category_dropdown.id;
        tempHTML = "";
        // TODO: Let me find which onclick function to call, will be back real quick!!
        for (let i = 0; i < state_extraction_targets.length; i++) {
          tempHTML += `<button class="dropdown-content-item" onclick = 'dropdownContentItemConnectionHandler("${connection_id.slice(
            0,
            -9,
          )}", "switch-head", "${
            state_extraction_targets[i]
          }: ")' style = "z-index: 2;">${
            state_extraction_targets[i]
          }</button>\n`;
        }
        category_dropdown.innerHTML = tempHTML;
      });
      /* Populate Target */
      target_dropboxes.forEach((target_dropdown) => {
        connection_id = target_dropdown.id;
        tempHTML = "";
        /* Inject Conditions */
        for (let i = 0; i < state_condition_targets.length; i++) {
          tempHTML += `<button class="dropdown-content-item" onclick = 'dropdownContentItemConnectionHandler("${connection_id.slice(
            0,
            -7,
          )}", "switch-target", "${
            state_condition_targets[i]
          }")' style = "z-index: 2;">${state_condition_targets[i]}</button>\n`;
        }
        target_dropdown.innerHTML = tempHTML;
      });
    }
    autoCompleteData = extractValues(
      global_init_header_page_data,
      autoCompleteData,
    );
  } else {
    // Update value in global_init_header_page_data
    console.log("hits `else` in injectLinkTargets_sync");
  }
}

function changeDataContainerState(
  action,
  sequence_id,
  type,
  name = null,
  subfield = null,
) {
  /* Planning to take in subfield as a string, exact format has not been decided yet... */
  switch (action) {
    case "add":
      var element = document.querySelector(
        `.data-container[id="${sequence_id}"]`,
      );
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
                                      </div>`;
      /* Add extraction targets to dropdown menus */
      if (name) {
        /* If name is not defined, that indicates changeDataContainerState is called from initial html injection. */
        console.log("add", type, sequence_id, name, `'${temp_display_string}'`);

        syncDropdownContent(
          "add",
          type,
          sequence_id,
          name,
          temp_display_string,
        );
      }
      highest_subfield_sequence_under_headers_page_variables[sequence_id] += 1;
      break;
    case "delete":
      var element = document.querySelector(
        `.data-container[id="${sequence_id}"]`,
      );
      element.remove();
      /* Remove extraction targets to dropdown menus */
      syncDropdownContent("remove", type, sequence_id, name);
      break;
    case "edit":
      /* Edit the name of the main component. */
      /* Same logic as editing data items, for edit, then reformulate. */
      var element = document.querySelector(
        `.data-container[id="${sequence_id}"]`,
      );
      var name_div = element.querySelector(`.data-name`);
      var divs_under_subfield = name_div.children;

      var string = name_div.textContent.trim();
      divs_under_subfield[
        divs_under_subfield.length - 1
      ].children[0].setAttribute("class", "fa-solid fa-check fa-lg");
      /* Convert something to a textbox with the option of an onclick. */
      /* Hacky solution... Modify the innerHTML of the thing directly. */
      // Create a regular expression using the variable
      const regex = new RegExp(string, "g");
      counter = 0;
      // Replace the first occurrence of the pattern with a specific value
      name_div.innerHTML = name_div.innerHTML.replace(regex, (match) => {
        if (match === `${string}` && counter == 0) {
          counter += 1;
          return `<input id = "dataname-${sequence_id}" type="text" value="${string}"></input>\n`;
        }
        return match;
      });

      console.log(
        `reformulateDataName(${sequence_id}, "${type}", "${name}", "${subfield}")`,
      );
      divs_under_subfield[divs_under_subfield.length - 1].setAttribute(
        "onclick",
        `reformulateDataName(${sequence_id}, "${type}", "${name}", "${subfield}")`,
      );

      break;
  }
}

function syncDropdownContent(
  mode,
  type,
  sequence_id,
  name = null,
  subfield = null,
  target = null,
) {
  console.log(
    "syncDropdownContent",
    mode,
    type,
    sequence_id,
    name,
    subfield,
    target,
  );
  /* Modify extraction targets and condition targets. */
  subfield_list = subfield.trim().split("  ");
  console.log(subfield_list);
  switch (mode) {
    case "add":
      if (subfield != null) {
        /* To be completed whenever subfield additions are completed. */
        /* 1. Search for names, if they already have been inserted before. */
        /* 2. Do insertion. */
        /* Not activated for now because everything is a mess. */
        if (!window.header_name_dict.hasOwnProperty(name)) {
          /* This means that the name has not been added before. */
          switch (type) {
            case "headers":
              global_init_header_page_data[type].push({
                name: name,
                fields: [],
              });
              break;
            case "structs":
              global_init_header_page_data[type].push({
                name: name,
                content: [],
              });
              break;
            default:
              global_init_header_page_data[type].push({ name: name });
          }
          window.header_name_dict[name] =
            global_init_header_page_data[type].length - 1;
        }
        /* Add the subfield to the corresponding data structure. */
        /* TODO: Don't forget to change the hardcoding!!!! */
        switch (type) {
          case "headers":
            global_init_header_page_data[type][window.header_name_dict[name]][
              "fields"
            ].push({ name: subfield_list[0], type: subfield_list[1] });
            break;
          case "structs":
            global_init_header_page_data[type][window.header_name_dict[name]][
              "content"
            ].push({ name: subfield_list[0], type: subfield_list[1] });
            break;
          case "vars":
            global_init_header_page_data[type][window.header_name_dict[name]][
              "type"
            ] = subfield_list[subfield_list.length - 2];
            global_init_header_page_data[type][window.header_name_dict[name]][
              "value"
            ] = subfield_list[subfield_list.length - 1];
            global_init_header_page_data[type][window.header_name_dict[name]][
              "const"
            ] = subfield_list.length == 3 ? 1 : 0;
            break;
          case "typedef":
            global_init_header_page_data[type][window.header_name_dict[name]][
              "bit"
            ] = parseInt(subfield_list[0].trim().slice(4, -1));
            break;
        }
      } else {
        console.log("added", name);
        global_init_header_page_data[type].push({ name: name });
        window.header_name_dict[name] =
          global_init_header_page_data[type].length - 1;
      }
      break;
    case "remove":
      for (let doc in global_init_header_page_data[type]) {
        console.log(global_init_header_page_data[type][doc]["name"], name);
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
            global_init_header_page_data[type].push({ name: name });
            window.header_name_dict[name] =
              global_init_header_page_data[type].length - 1;
          }
          var origin_index = window.header_name_dict[name];
          global_init_header_page_data[type][origin_index]["name"] = target;
          window.header_name_dict[target] = origin_index;
          if (target != name) {
            delete window.header_name_dict[name];
          }

          // Change the params of the onclick field.
          var element = document.querySelector(
            `.data-container[id="${sequence_id}"]`,
          );
          const buttonElement = element.querySelectorAll(".btn")[2];
          const onclickAttributeValue = buttonElement.getAttribute("onclick");
          const currentText = onclickAttributeValue.match(/'([^']*)'/g)[3];
          const newText = onclickAttributeValue.replace(
            currentText,
            `'${target}'`,
          );
          // Update the onclick attribute with the new text
          buttonElement.setAttribute("onclick", newText);
        }
      } else {
        // we are editing the name of a subfield.
        var origin_index = window.header_name_dict[name];
        console.log(global_init_header_page_data[type][origin_index]["name"]);
      }
      break;
    default:
      break;
  }

  /* Regenerate existing dropdown menus, if there is any out there. */
  state_extraction_targets = updateStateExtractionTarget();
  state_condition_targets = updateStateConditionTarget();
}

function deleteDataItem(sequence_id, subfield_sequence, name, type) {
  /* Also need to port in parent name also in addition to these sequences. */
  var seq_div = document.querySelector(`.data-container[id="${sequence_id}"]`);
  var subfield_div = seq_div.querySelector(
    `.data-item[id="${subfield_sequence}"]`,
  );

  /* Short circuit the logic so that we don't waste anytime serving variables and typedefs. */
  if (type != "headers" && type != "structs") {
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
      unique_identifier = [
        "name",
        subfield_div.querySelectorAll("span")[1].innerText.trim(),
      ];
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
        if (
          global_init_header_page_data[type][doc]["fields"][index][
            unique_identifier[0]
          ] == unique_identifier[1]
        ) {
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
      for (let index in global_init_header_page_data["structs"][doc][
        "content"
      ]) {
        console.log(
          global_init_header_page_data["structs"][doc]["content"],
          global_init_header_page_data["structs"][doc]["content"][index][
            "type"
          ] == name,
        );
        if (
          global_init_header_page_data["structs"][doc]["content"][index][
            "type"
          ] == name
        ) {
          nukeButtonsByInnerText(
            `.${global_init_header_page_data["structs"][doc]["content"][index]["name"]}.${unique_identifier[1]}`,
          );
        }
      }
    }
  }
}

function editDataItem(sequence_id, subfield_sequence, name, type) {
  console.log(
    "editDataItem is here!, of type: ",
    sequence_id,
    subfield_sequence,
    name,
    type,
  );
  var seq_div = document.querySelector(`.data-container[id="${sequence_id}"]`);
  var subfield_div = seq_div.querySelector(
    `.data-item[id="${subfield_sequence}"]`,
  );
  // Extract all textual components into a formatted string and display that string in a text box.
  var divs_under_subfield = subfield_div.children;
  var subfields = [];
  divs_under_subfield[divs_under_subfield.length - 1].children[0].setAttribute(
    "class",
    "fa-solid fa-check fa-lg",
  );
  divs_under_subfield[divs_under_subfield.length - 1].setAttribute(
    "onclick",
    `reformulateDataItem(${sequence_id}, ${subfield_sequence}, '${name}', '${type}', null)`,
  );
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
  subfield_div.innerHTML = subfield_div.innerHTML.replace(
    /null/g,
    `'${string}'`,
  );
  console.log("subfield_div.innerHTML: ", subfield_div.innerHTML);
}

function reformulateDataItem(
  sequence_id,
  subfield_sequence,
  name,
  type,
  args = null,
) {
  console.log(
    "reformulateDataItem is here!: ",
    sequence_id,
    subfield_sequence,
    name,
    type,
    args,
  );
  var seq_div = document.querySelector(`.data-container[id="${sequence_id}"]`);
  var subfield_div = seq_div.querySelector(
    `.data-item[id="${subfield_sequence}"]`,
  );
  var input_element = document.querySelector(
    `input#i-${sequence_id}-${subfield_sequence}`,
  );
  var divs_under_subfield = subfield_div.children;
  old_value = args;
  old_fields = old_value.replace(/\s+/g, " ").trim().split(" ");
  input_value = input_element.value;
  input_fields = input_value.replace(/\s+/g, " ").trim().split(" ");
  returned_div = null;
  unique_identifier = null;
  console.log(old_fields, input_fields);
  switch (input_fields.length) {
    case 1:
      returned_div = `<span style = "color: #007BFF">${input_fields[0]} </span>\n`;
      break;
    case 2:
      returned_div = `<span style = "color: #007BFF">${input_fields[0]} </span>
             <span>${input_fields[1]}</span>\n`;
      break;
    case 3:
      returned_div = `<span style = "color: #DC3545">${input_fields[0]}</span>
             <span style = "color: #007BFF">${input_fields[1]} </span>
             <span>${input_fields[2]}</span>\n`;
      break;
    default:
      break;
  }
  divs_under_subfield[0].remove();
  var cached_html = subfield_div.innerHTML;
  subfield_div.innerHTML = returned_div + cached_html;
  divs_under_subfield[divs_under_subfield.length - 1].children[0].setAttribute(
    "class",
    "fa-solid fa-pen-to-square fa-lg",
  );
  divs_under_subfield[divs_under_subfield.length - 1].setAttribute(
    "onclick",
    `editDataItem(${sequence_id}, ${subfield_sequence}, '${name}', '${type}')`,
  );

  console.log(subfield_div, subfield_div.querySelectorAll("span").length);
  /* TODO: Sync up the global dictionary */
  console.log(subfield_div.querySelectorAll("span").length);
  switch (subfield_div.querySelectorAll("span").length) {
    case 1:
      /* typedefs only */
      new_value = subfield_div
        .querySelectorAll("span")[0]
        .innerText.trim()
        .slice(4, -1);
      /* dive into the dictionary and change */
      for (let doc in global_init_header_page_data["typedefs"]) {
        if (global_init_header_page_data["typedefs"][doc]["name"] == name) {
          console.log("case 1 typedefs: found it");
          global_init_header_page_data["typedefs"][doc]["bit"] =
            parseInt(new_value);
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
      if (type == "vars") {
        for (let doc in global_init_header_page_data["vars"]) {
          if (global_init_header_page_data["vars"][doc]["name"] == name) {
            console.log("case 2 vars: found it");
            global_init_header_page_data["vars"][doc]["type"] = new_type;
            global_init_header_page_data["vars"][doc]["value"] = new_value;
            // This is specifically designed for the case const switching.
            global_init_header_page_data["vars"][doc]["const"] = 0;
          }
        }
      } else if (type == "headers") {
        for (let doc in global_init_header_page_data[type]) {
          if (global_init_header_page_data[type][doc]["name"] == name) {
            for (let index in global_init_header_page_data[type][doc][
              "fields"
            ]) {
              console.log(
                global_init_header_page_data[type][doc]["fields"][index][
                  "type"
                ] == old_fields[0],
              );
              if (
                global_init_header_page_data[type][doc]["fields"][index][
                  "type"
                ] == old_fields[0] &&
                global_init_header_page_data[type][doc]["fields"][index][
                  "name"
                ] == old_fields[1]
              ) {
                console.log("case 2 headers: found it");
                global_init_header_page_data[type][doc]["fields"][index][
                  "type"
                ] = input_fields[0];
                global_init_header_page_data[type][doc]["fields"][index][
                  "name"
                ] = input_fields[1];
              }
            }
          }
        }
      } else {
        // structs
        for (let doc in global_init_header_page_data[type]) {
          if (global_init_header_page_data[type][doc]["name"] == name) {
            for (let index in global_init_header_page_data[type][doc][
              "content"
            ]) {
              if (
                global_init_header_page_data[type][doc]["content"][index][
                  "type"
                ] == old_fields[0] &&
                global_init_header_page_data[type][doc]["content"][index][
                  "name"
                ] == old_fields[1]
              ) {
                global_init_header_page_data[type][doc]["content"][index][
                  "type"
                ] = input_fields[0];
                global_init_header_page_data[type][doc]["content"][index][
                  "name"
                ] = input_fields[1];
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

  injectLinkTargets_sync((init = false));
}

function reformulateDataName(
  sequence_id,
  type = null,
  name = null,
  subfield = null,
) {
  console.log("reformulate Data name");
  var input_element = document.querySelector(`input#dataname-${sequence_id}`);
  input_value = input_element.value.trim();
  returned_div = input_value + "\n";
  input_element.remove();

  var element = document.querySelector(`.data-container[id="${sequence_id}"]`);
  var name_div = element.querySelector(`.data-name`);
  name_div.innerHTML = returned_div + name_div.innerHTML;
  divs_under_subfield = name_div.children;

  divs_under_subfield[divs_under_subfield.length - 1].children[0].setAttribute(
    "class",
    "fa-solid fa-pen-to-square fa-lg",
  );

  divs_under_subfield[divs_under_subfield.length - 1].setAttribute(
    "onclick",
    `changeDataContainerState('edit', '${sequence_id}', '${type}', '${name}', '${subfield}')`,
  );

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

function replaceButtonsByInnerText(
  pattern,
  sequence_id,
  subfield_id,
  input_fields,
) {
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
  if (e.target.className == "autocompleteInput") {
    if (
      e.key == "Tab" &&
      e.target.dataset.suggestedWord &&
      e.target.value.trim() != e.target.dataset.suggestedWord
    ) {
      e.preventDefault();
      splitValue = e.target.value.split(" ");
      console.log(
        e.target.value,
        splitValue[splitValue.length - 1],
        e.target.dataset.suggestedWord,
      );
      e.target.value = replaceLastOccurrence(
        e.target.value,
        splitValue[splitValue.length - 1],
        e.target.dataset.suggestedWord,
      );
      console.log("target value", e.target.value);
    }
  }
});

window.addEventListener("contextmenu", function (e) {
  injectLinkTargets_sync(false);
});

window.addEventListener("keydown", function (event) {
  if ((event.ctrlKey || event.metaKey) && event.key === "s") {
    console.log("Hey! Ctrl+S or Command+S event captured!");
    event.preventDefault();
    let errors_returned = checkWorkspaceSyntaxStatus();
    displayErrors(errors_returned);
  }
  if ((event.ctrlKey || event.metaKey) && event.key === "f") {
    console.log("Hey! Ctrl+F or Command+F event captured!");
    event.preventDefault();
    ToggleWorkspaceSearchBar();
  }
});

/***********************************Misc functions****************************/
function addActionModuleStatements(node_id) {
  if (highest_node_sequence[node_id] > 2) {
    return;
  }
  actions_page_items = document.querySelector(".actions-page-items");
  matches = actions_page_items.querySelectorAll(`#${node_id}`);
  node_display_content = matches[0].childNodes[1];
  const newDiv = document.createElement("div");
  newDiv.classList.add("module-element");
  newDiv.setAttribute(
    "id",
    `statement-${node_id}-${highest_node_sequence[node_id]}-action-only`,
  );
  newDiv.innerHTML =
    STATEMENTS["action"](node_id, highest_node_sequence[node_id]) + "<br>";
  /* increments node_sequence to prevent collisions. */
  highest_node_sequence[node_id] += 1;
  /* Append the new div as a child of the parent div. */
  node_display_content.appendChild(newDiv);
  console.log(node_display_content);
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
    `statement-${node_id}-${highest_node_sequence[node_id]}-state-${global_source_workspace}`,
  );
  newDiv.innerHTML =
    STATEMENTS["state"](node_id, highest_node_sequence[node_id]) + "<br>";
  /* inject `state_extract_targets` into corresponding fields. */
  await resolveExtractionTargets();
  dropdownDivs = newDiv.getElementsByClassName("dropdown-content");
  console.log(dropdownDivs);
  const target_div = dropdownDivs[1];
  var tempHTML = "";
  for (let i = 0; i < state_extraction_targets.length; i++) {
    tempHTML += `<button class="dropdown-content-item" onclick="dropdownContentItemHandler('${node_id}', '${highest_node_sequence[node_id]}', 'target', '${state_extraction_targets[i]}')">${state_extraction_targets[i]}</button>\n`;
  }
  target_div.innerHTML = tempHTML;

  /* increments node_sequence to prevent collisions. */
  highest_node_sequence[node_id] += 1;
  /* Append the new div as a child of the parent div. */
  node_display_content.appendChild(newDiv);
}

// Hover.
if (document.querySelector("body > p:hover") != null) {
  console.log("hovered");
}

function addActionModule() {
  raw_html_string = `<div id="node-${highest_headers_page_variable_sequence}" class="drawflow-node action-only"
                      style="width: 400px; min-height: 200px; border-radius: 10px; background: #DB3A34; align-items: baseline;">
                      <div class="drawflow_content_node" style="display: flex; flex-direction: column;">
                        <div class="module-element">
                          <p style="justify-content: center; float:left; margin: auto; max-height: 25px;"> Action </p>
                          <p style="justify-content: center; float:left; margin: auto; max-height: 25px;"> <input id="action-input-field"
                              placeholder="Action name" style="font-family:Courier, monospace; background: transparent;"> </p>
                          <p style="justify-content: center; float:right; max-height: 25px;">
                            <button class="btn" onclick="addModuleStatements('node-${highest_headers_page_variable_sequence}', 'action')"
                             style = "padding-left: 2px; padding-right: 5px; padding-bottom: 5px;">
                              <i class="fa-sharp fa-solid fa-circle-plus fa-lg" style="color: #1f2551;"></i>
                            </button>
                          </p>
                          <p style="justify-content: center; float:right; max-height: 25px;">
                            <button class="btn" onclick="removeActionModule('node-${highest_headers_page_variable_sequence}')"
                             style = "padding-left: 2px; padding-right: 10px; padding-bottom: 5px;">
                              <i class="fa fa-times-circle fa-lg" style="position:relative; color:maroon"></i>
                            </button>
                          </p>
                        </div>
                        <div class="module-element" id = "node-${highest_headers_page_variable_sequence}-labels"
                         style = "display: flex; flex-direction: row;"> 
                        </div>
                      </div>
                    </div>`;
  new_html_element = document.createElement("div");
  new_html_element.innerHTML = raw_html_string;
  document.querySelector(`.actions-page-items`).appendChild(new_html_element);
  highest_headers_page_variable_sequence += 1;
}

function expandActionCode(node_id, sequence_id) {
  /* toggle on blur, and bring up the code block */
  document.querySelector(
    `.blur-filter.${node_id}-${sequence_id}`,
  ).style.display = "block";
  console.log(document.querySelector(`.blur-filter.${node_id}-${sequence_id}`));
  document.querySelector(
    `#statement-${node_id}-${sequence_id}-action-only.module-element .CodeMirror.cm-s-default`,
  ).style.display = "block";
  document.getElementById(
    `action-code-hide-${node_id}-${sequence_id}`,
  ).style.display = "flex";
  /* Keep code blocks un-blurred */
  return;
}

function hideActionCode(node_id, sequence_id) {
  /* Do the reverse of expandActionCode */
  /* toggle on blur, and bring up the code block */
  document.querySelector(
    `.blur-filter.${node_id}-${sequence_id}`,
  ).style.display = "none";
  document.querySelector(
    `#statement-${node_id}-${sequence_id}-action-only.module-element .CodeMirror.cm-s-default`,
  ).style.display = "none";
  document.getElementById(
    `action-code-hide-${node_id}-${sequence_id}`,
  ).style.display = "none";
  /* Keep code blocks un-blurred */
  return;
}

function extractActionCore(input) {
  /* 
   V1Switch:
   Verify Checksum: (inout headers hdr, inout metadata meta)
   Ingress Controller: (inout headers hdr,
                        inout metadata meta,
                        inout standard_metadata_t standard_metadata)
   Egress Controller:  (inout headers hdr,
                        inout metadata meta,
                        inout standard_metadata_t standard_metadata)
   Compute Checksum:   (inout headers hdr, inout metadata meta)
   Deparser:           (packet_out packet, in headers hdr) 
  */
  const nameRegex = /(?<=action).*?(?=\()/g;
  const actionRegex = /action\s+(\w+)\s*\(([^)]+)\)/;
  const match = input.match(actionRegex);
  const contentRegex = /action\s+(\w+)\([\w\s,_]*\)\s*\{([\s\S]*?)\}/g;

  const raw_content = contentRegex.exec(input);
  const content = raw_content ? raw_content[2].trim() : null;

  console.log("Captured body:", content);
  let labels = [];
  let actionVariableUsage = [];

  if (content !== null) {
    // Ensure there's a match
    let variables = ["hdr", "meta", "standard_metadata", "packet"];

    const variableRegex1 = /(\w+)\.\w+/g;
    const variableRegex2 = /\b(\w+)\b/g;
    let match;
    let uniqueVariables = new Set();

    // Capture compound names
    while ((match = variableRegex1.exec(content)) !== null) {
      uniqueVariables.add(match[1]);
    }

    // Capture simple names
    while ((match = variableRegex2.exec(content)) !== null) {
      uniqueVariables.add(match[1]);
    }

    let intersection = new Set();
    for (const variable of variables) {
      if (uniqueVariables.has(variable)) {
        intersection.add(variable);
      }
    }
    actionVariableUsage = Array.from(intersection);
  }

  if (
    !actionVariableUsage.includes("standard_metadata") &&
    !actionVariableUsage.includes("packet")
  ) {
    if (!labels.includes("checksum")) {
      labels.push("Checksum");
    }
  }
  if (
    !actionVariableUsage.includes("packet") &&
    actionVariableUsage.includes("standard_metadata")
  ) {
    if (!labels.includes("ingress/egress")) {
      labels.push("Ingress / Egress");
    }
  }
  if (
    !actionVariableUsage.includes("meta") &&
    actionVariableUsage.includes("standard_metadata")
  ) {
    if (!labels.includes("deparser")) {
      labels.push("Deparser");
    }
  }
  if (actionVariableUsage.length == 0) {
    labels = ["Ingress / Egress", "Deparser", "Checksum"];
  }

  if (!match) {
    /* In this case, there is no argument that is passed into the action. */
    /* Which is fine for now. */
    return { name: input.match(nameRegex)[0].trim(), args: [], labels };
  }

  const name = match[1];
  const args = match[2].split(",").map((arg) => arg.trim());

  return {
    name,
    args,
    labels,
  };
}

function waitForElement(elementFn) {
  return new Promise((resolve) => {
    function checkElement() {
      const element = elementFn();
      if (element) {
        resolve(element);
      } else {
        setTimeout(checkElement, 100);
      }
    }
    checkElement();
  });
}

function populateActionPage(INIT_ACTION_PAGE_DATA) {
  /* Do something here haha */
  /* Create action page items on the action Page */
  Object.keys(INIT_ACTION_PAGE_DATA).forEach((key) => {
    const code = INIT_ACTION_PAGE_DATA[key]["code"];
    const value = INIT_ACTION_PAGE_DATA[key]["metadata"];
    if (value == null) {
      args = [];
      name_ = "";
      labels = [];
    } else {
      args = "args" in value ? value["args"] : [];
      name_ = value["name"];
      labels = value["labels"];
    }
    // Add action module onto action page.
    assigned_node_id = `node-${highest_headers_page_variable_sequence}`;
    console.log(assigned_node_id);
    addActionModule();
    // Name
    document
      .querySelector(`div#${assigned_node_id}.drawflow-node.action-only`)
      .querySelector(`#action-input-field`).value = name_;
    // Description
    addActionModuleStatements(assigned_node_id);
    textarea = document
      .querySelector(`div#statement-${assigned_node_id}-0-action-only`)
      .querySelector(`textarea`);
    textarea.value = "To be specified.";
    // Inputs
    addActionModuleStatements(assigned_node_id);
    // TODO: Modify this to be dynamic.
    textarea = document.querySelector(
      `div#formatable-input-field-${assigned_node_id}`,
    );
    textarea.innerHTML = highlightTypes(args);
    // Code
    addActionModuleStatements(assigned_node_id);
    ((current_node_id, code) => {
      waitForElement(() =>
        document
          .getElementById(`statement-${current_node_id}-2-action-only`)
          .querySelector(`.CodeMirror-code`),
      ).then(() => {
        formatCodeToCodeMirror(current_node_id, code);
      });
    })(assigned_node_id, code);
    // Labels
    label_space = document.querySelector(`div#${assigned_node_id}-labels`);
    // Now we hardcode the number of labels, but we should be able to do this dynamically.
    for (let i = 0; i < labels.length; i++) {
      label_space.innerHTML += `<button style = "margin-left: 3px;">
                                  ${labels[i]}
                                </button>`;
    }
  });
}

function formatCodeToCodeMirror(node_id, code) {
  action_code_editor[`statement-${node_id}-2-action-only`].setValue(code);
}

function fetchCodeFromCodeMirror(node_id) {
  return action_code_editor[`statement-${node_id}-2-action-only`].getValue();
}

// Populate existing module by the code inputted into the code block.
function populateActionModuleByCode(node_id) {
  let code = fetchCodeFromCodeMirror(node_id);
  metadata = extractActionCore(code);
  // put the metadata back to where they were.
  document
    .querySelector(`div#${node_id}.drawflow-node.action-only`)
    .querySelector(`#action-input-field`).value = metadata["name"];
  // Description
  textarea = document
    .querySelector(`div#statement-${node_id}-0-action-only`)
    .querySelector(`textarea`);
  textarea.placeholder = "";
  // Inputs
  textarea = document.querySelector(`div#formatable-input-field-${node_id}`);
  // Reattach the event listener for inputs.
  lalala = highlightTypes(metadata["args"]);
  textarea.innerHTML = lalala;
  attachHighlightEventListener(
    document.querySelector(`div#statement-${node_id}-1-action-only`),
  );
  // Labels
  label_space = document.querySelector(`div#${node_id}-labels`);
  // Now we hardcode the number of labels, but we should be able to do this dynamically.
  label_space.innerHTML = "";
  for (let i = 0; i < metadata["labels"].length; i++) {
    label_space.innerHTML += `<button style = "margin-left: 3px;">
                                ${metadata["labels"][i]}
                              </button>`;
  }
  return;
}

function highlightTypes(args) {
  let raw_html_data = "";
  // global_init_header_page_data;
  for (let i = 0; i < args.length; i++) {
    split_args = args[i].split(" ");
    let type = split_args[0];
    let name_ = split_args[1];
    raw_html_data += `<div class="input_argument-line" style = "display: -webkit-box; height: 30px;">
                      <span style = "color: teal;" class = "highlighted-type" id = "highlighted-type-${type}" ><strong>${type} </strong></span> 
                      <span>${name_} </span>
                      </div>`;
  }
  return raw_html_data;
}

function findDataContainerByDataName(data_name) {
  // Returns a copy of the data container.
  const dataNameElements = document.querySelectorAll(".data-name");

  let dataContainer = null;

  for (const element of dataNameElements) {
    if (element.textContent.trim().includes(data_name)) {
      dataContainer = element.closest(".data-container");
      break;
    }
  }

  if (dataContainer) {
    return dataContainer.cloneNode(true); // Clone the node and its children
  } else {
    return null;
  }
}

function attachHighlightEventListener(node) {
  let highlighted_types = node.querySelectorAll(`span.highlighted-type`); // get the div element
  for (let [index, highlighted_type] of Array.from(
    highlighted_types,
  ).entries()) {
    console.log("line 1917 highlighted_type", highlighted_type);
    highlighted_type.addEventListener("mouseover", function (e) {
      /* Fetch the type information from the header page. */
      text_content = highlighted_type.textContent.trim();
      global_init_header_page_data["typedefs"].forEach((element) => {
        console.log(element["name"], text_content);
        if (element["name"] == text_content) {
          /* Copy over the box from the header page. */
          cloned_container = findDataContainerByDataName(text_content);
          const buttons = cloned_container.querySelectorAll("button"); // Find all button elements within the cloned container

          buttons.forEach((button) => {
            button.remove(); // Remove each button
          });

          // Position the cloned container absolutely and directly under body.
          const rect = highlighted_type.getBoundingClientRect();
          const top = window.scrollY + rect.top;
          const left = window.scrollX + rect.left;

          // Set the style for cloned_container
          cloned_container.id = `cloned-${node.id}-${index}`;
          cloned_container.style.position = "absolute";
          cloned_container.style.top = top + 10 + "px";
          cloned_container.style.left = left + 20 + "px";
          cloned_container.style.zIndex = 200;

          // Append it to body
          document.body.appendChild(cloned_container);
        }
      });
    });

    highlighted_type.addEventListener("mouseout", function (e) {
      /* Remove the type information from the header page. */
      document.getElementById(`cloned-${node.id}-${index}`).remove();
    });
  }
}

function removeActionModule(node_id) {
  console.log("line 1959", document.getElementById(node_id).parentNode);
  document.getElementById(node_id).parentNode.remove();
}

function searchActionPage(keyword) {
  // This is a naive implementation of the search function.
  // We could have supported elasticsearch or something, but that's not the main point of this project.
  // 1. Search by name, type, label, description, code
  /* General flow: get a set of ids, and then disable all the ids that are not in the set. */
  let disabled_divs = new Set();
  document.querySelectorAll(".actions-page-items > div").forEach((elem) => {
    all_divs = elem.querySelectorAll("div");

    // Loop through all div elements
    all_divs.forEach((div) => {
      const nodeRegex = /^node-\d+$/;
      // Check if the div's ID matches the node-X pattern and contains the keyword
      if (nodeRegex.test(div.id)) {
        if (!div.textContent.toLowerCase().includes(keyword)) {
          disabled_divs.add(div);
        }
      }
    });
  });
  disabled_divs.forEach((div) => {
    div.parentNode.style.display = "none";
  });
  return;
}

function enableAllActionModules() {
  document.querySelectorAll(".actions-page-items > div").forEach((elem) => {
    all_divs = elem.querySelectorAll("div");
    // Loop through all div elements
    all_divs.forEach((div) => {
      const nodeRegex = /^node-\d+$/;
      if (nodeRegex.test(div.id)) {
        div.parentNode.style.display = "block";
      }
    });
  });
  return;
}

function controlSwitch(target_workspace) {
  // Turn off headers and actions before switch. */
  if (!display_headers_page) {
    HeaderDisplaySetting();
  }
  if (!display_actions_page) {
    ActionDisplaySetting();
  }
  /* General flow: Switches workspace and drawflow editor to the new workspace. */
  /* If the target workspace has not been initialized, initialize it. */
  if (!(target_workspace in global_flow_editors)) {
    var example = document.getElementById(`drawflow-${target_workspace}`);
    global_flow_editor = new Drawflow(example);
    global_flow_editor.start();
    global_flow_editors[target_workspace] = global_flow_editor;
    // add workspace transition modules to it lol.
    var html_prev = `<p style="text-align:center; font-family:Courier, monospace;"><i class="fa-solid fa-arrow-left fa-beat" style="margin-right: 8px;"></i>${workspace_transition_dict[target_workspace][0]}</p>`;
    var html_post = `<p style="text-align:center; font-family:Courier, monospace;">${workspace_transition_dict[target_workspace][1]}<i class="fa-solid fa-arrow-right fa-beat" style="margin-left: 8px;"></i></p>`;

    if (target_workspace != "parser" && target_workspace != "deparser") {
      global_flow_editors[target_workspace].addNode(
        "New Node 1",
        0,
        1,
        40,
        400,
        `generic ${target_workspace} prev`,
        {},
        html_prev,
      );
      global_flow_editors[target_workspace].addNode(
        "New Node 2",
        1,
        0,
        1500,
        400,
        `generic ${target_workspace} post`,
        {},
        html_post,
      );
      addWorkspaceTransitionButtonClickHandler(
        "prev",
        target_workspace,
        workspace_transition_dict[target_workspace][2],
      );
      addWorkspaceTransitionButtonClickHandler(
        "post",
        target_workspace,
        workspace_transition_dict[target_workspace][3],
      );
    } else if (target_workspace == "parser") {
      global_flow_editors[target_workspace].addNode(
        "New Node 1",
        0,
        1,
        40,
        400,
        `begin-sign`,
        {},
        html_begin,
      );
      global_flow_editors[target_workspace].addNode(
        "New Node 2",
        1,
        0,
        1500,
        400,
        `generic ${target_workspace} post`,
        {},
        html_post,
      );
      addWorkspaceTransitionButtonClickHandler(
        "post",
        target_workspace,
        workspace_transition_dict[target_workspace][3],
      );
    } else {
      global_flow_editors[target_workspace].addNode(
        "New Node 1",
        0,
        1,
        40,
        400,
        `generic ${target_workspace} prev`,
        {},
        html_prev,
      );
      global_flow_editors[target_workspace].addNode(
        "New Node 2",
        1,
        0,
        1500,
        400,
        `stop-sign`,
        {},
        html_stop,
      );
      addWorkspaceTransitionButtonClickHandler(
        "prev",
        target_workspace,
        workspace_transition_dict[target_workspace][2],
      );
    }
  }

  /* Hide the original workspace and expose the new one. */
  document.getElementById(`drawflow-${global_source_workspace}`).style.display =
    "none";
  document.getElementById(`drawflow-${target_workspace}`).style.display =
    "block";
  /* Switch tab color. */
  document.querySelector(`button#${global_source_workspace}`).style.background =
    "linear-gradient(to bottom, #91c3e0, #609cb2)";
  document.querySelector(`button#${target_workspace}`).style.background =
    "linear-gradient(to bottom, #406a7e, #30505e)";
  /* Update previous workspace syntax status. */
  checkWorkspaceSyntaxStatus(global_source_workspace);
  /* Switch off the current variable hub, if there is any. */
  if (document.querySelector(`div#variable-hub-${global_source_workspace}`)) {
    document.querySelector(
      `div#variable-hub-${global_source_workspace}`,
    ).style.display = "none";
  }
  /* Switch on the target variable hub, if it is toggled on. */
  if (
    variable_hub_enabled_dict[target_workspace] == true &&
    document.querySelector(`div#variable-hub-${target_workspace}`)
  ) {
    document.querySelector(
      `div#variable-hub-${target_workspace}`,
    ).style.display = "flex";
  }
  /* Update global source workspace to the target workspace. */
  global_source_workspace = target_workspace;
  /* Update the add module button text. */
  let add_module_button_text = document.querySelector(`span.add-module-text`);
  if (global_source_workspace === "parser") {
    add_module_button_text.innerHTML = "Add State Module";
  } else if (
    global_source_workspace === "ingress" ||
    global_source_workspace === "egress"
  ) {
    add_module_button_text.innerHTML = "Add Table Module";
  } else {
    add_module_button_text.innerHTML = "Add Action Module";
  }
  // Refresh the code display settings as well if needed.
  adjustWorkspaceWidth();
  return;
}

function checkWorkspaceSyntaxStatus() {
  /* 
     Mainly looking for the following errors:
     1. Unconnected nodes
     2. Unnamed modules / Duplicate modules.
     3. Undefined transition conditions.
     TODO: Shouldn't worry about it right NOW... We still have bigger fish to fry... 
  */
  current_workspace = global_flow_editors[global_source_workspace];
  var errors_returned = new Set();
  let syntax_check_failed = false;
  current_workspace_content = document
    .querySelector(`div#drawflow-${global_source_workspace}`)
    .querySelector(`.drawflow`);
  if (
    current_workspace_content === null ||
    current_workspace_content.innerHTML == ""
  ) {
    /* Short circuit if we haven't made any changes to the workspace. 
        Or all the changes have been removed. 
        In that case we ALWAYS switch the status light to green. */
    updateStatusLight("lime");
    return;
  }

  let workplace_nodes = document
    .querySelectorAll(
      `div.drawflow-child#drawflow-${global_source_workspace}`,
    )[0]
    .querySelector("div.drawflow")
    .querySelectorAll("div.parent-node");

  let detectable_inputs = new Set();
  let detectable_outputs = new Set();
  let connections_with_repeated_outputs = new Set();

  for (let node of workplace_nodes) {
    // Finds whether these nodes have open inputs and outputs!!!
    if (node.childNodes.length == 0) {
      // There are orphaned nodes. It's an oversight that I have no time to fix.
      continue;
    }

    let child_node = node.childNodes[0];
    let child_id = child_node.id;
    let input_receptors = child_node.querySelector("div.inputs").childNodes;
    let output_receptors = child_node.querySelector("div.outputs").childNodes;

    if (input_receptors.length) {
      // Each node only has one input receptor.
      let input_receptor = input_receptors[0];
      let input_receptor_class_name = input_receptor.className;
      detectable_inputs.add(`${child_id} ${input_receptor_class_name}`);
    }
    if (output_receptors.length) {
      // Each node only has one output receptor.
      let output_receptor = output_receptors[0];
      let output_receptor_class_name = output_receptor.className;
      detectable_outputs.add(`${child_id} ${output_receptor_class_name}`);
    }
  }

  let workplace_connections = document
    .querySelectorAll(
      `div.drawflow-child#drawflow-${global_source_workspace}`,
    )[0]
    .querySelector("div.drawflow")
    .querySelectorAll('svg[class^="connection"]');

  if (workplace_connections.length) {
    for (let connection of workplace_connections) {
      let connection_name = connection.getAttribute("class");
      let connection_name_segments = connection_name.split(" ");

      let node_in_match = connection_name.match(/node_in_(\w+-\d+)/);
      let node_in = node_in_match ? node_in_match[1] : null;

      let node_out_match = connection_name.match(/node_out_(\w+-\d+)/);
      let node_out = node_out_match ? node_out_match[1] : null;

      let node_in_input_receptor =
        connection_name_segments[connection_name_segments.length - 2];
      let node_out_output_receptor =
        connection_name_segments[connection_name_segments.length - 3];
      // detect nodes and receptor pairs.
      if (detectable_inputs.has(`${node_in} input ${node_in_input_receptor}`)) {
        detectable_inputs.delete(`${node_in} input ${node_in_input_receptor}`);
      }

      if (
        detectable_outputs.has(`${node_out} output ${node_out_output_receptor}`)
      ) {
        detectable_outputs.delete(
          `${node_out} output ${node_out_output_receptor}`,
        );
      } else {
        // We know that this output is connected to multiple inputs. Therefore, they go into a separate bin.
        connections_with_repeated_outputs.add(connection_name);
      }
    }
  }

  if (detectable_inputs.size || detectable_outputs.size) {
    /* E1: Unconnected inputs / outputs */
    syntax_check_failed = true;
    errors_returned.add("E1: Unconnected inputs / outputs.");
  }

  connections_with_repeated_outputs.forEach((connection) => {
    let side_by_side = document
      .querySelectorAll(
        `div.drawflow-child#drawflow-${global_source_workspace}`,
      )[0]
      .querySelector(`div.side-by-side-div-${connection.replace(/ /g, "-")}`);

    if (side_by_side === null) {
      /* E2: No condition box specified between connections. */
      syntax_check_failed = true;
      errors_returned.add(
        "E2: No condition box specified between connections.",
      );
    }
  });

  let node_module_top_bars = document.querySelectorAll(
    `[id^="module-element-top-bar-${global_source_workspace}"]`,
  );
  let class_name_set = new Set();
  node_module_top_bars.forEach((node_module_top_bar) => {
    variable_name_is_legal_status = checkIllegalInputNames(
      node_module_top_bar.querySelector(`input`).value,
    )[0];
    console.log(variable_name_is_legal_status);
    if (
      class_name_set.has(node_module_top_bar.querySelector("input").value) ||
      node_module_top_bar.querySelector(`input`).value == "" ||
      variable_name_is_legal_status == false
    ) {
      /* E3: No unnamed, duplicate-named, and illegally named modules. */
      syntax_check_failed = true;
      errors_returned.add(
        "E3: No unnamed, duplicate-named, and illegally named modules.",
      );
    }
    class_name_set.add(node_module_top_bar.querySelector(`input`).value);
  });

  if (global_source_workspace == "parser") {
    for (let node of workplace_nodes) {
      var text_content_set = new Set();
      if (node.childNodes.length == 0) {
        // There are orphaned nodes. It's an oversight that I defintely have no time to fix.
        continue;
      }
      let child_node = node.childNodes[0];
      let drawflow_content_node = child_node.querySelector(
        "div.drawflow_content_node",
      );
      let content_module_elements =
        drawflow_content_node.querySelectorAll("div.module-element");
      if (!content_module_elements) {
        continue;
      }
      content_module_elements.forEach((content_module_element) => {
        if (content_module_element.id.startsWith("statement")) {
          if (!text_content_set.has(content_module_element.textContent)) {
            text_content_set.add(content_module_element.textContent);
          } else {
            /* E4: No duplicate dropdown options for state modules. */
            syntax_check_failed = true;
            errors_returned.add(
              "E4: No duplicate dropdown options for state modules.",
            );
          }

          dropdown_items = content_module_element.querySelectorAll(
            "button.dropdown-item",
          );

          if (
            Array.from(dropdown_items).some(
              (item) =>
                item.textContent.includes("Menu ▾") ||
                item.textContent.includes("Target ▾"),
            )
          ) {
            /* E5: Dropdown options have to be specified for state modules. */
            syntax_check_failed = true;
            errors_returned.add(
              "E5: Dropdown options have to be specified for state modules.",
            );
          }
        }
      });
    }
  }

  if (global_source_workspace !== "parser") {
    var variable_hub_element = document.querySelector(
      `div#variable-hub-${global_source_workspace}`,
    );
    var variable_hub_variables = variable_hub_element.querySelectorAll(
      `div.variable-hub-variables`,
    );
    var variable_hub_variable_names = new Set();
    for (let variable of variable_hub_variables) {
      let variable_name = variable.querySelector(`input`).value;
      if (variable_name == "") {
        /* E6: Variable hub variables have to be named. */
        syntax_check_failed = true;
        errors_returned.add("E6: Variable hub variables have to be named.");
      }

      if (!variable_hub_variable_names.has(variable_name)) {
        variable_hub_variable_names.add(variable_name);
      } else {
        /* E7: Variable hub variables have to be unique. */
        syntax_check_failed = true;
        errors_returned.add("E7: Variable hub variables have to be unique.");
      }

      let variable_function_window = variable.querySelector(
        `div.variable-hub-variable-function-window`,
      );

      let variable_code =
        local_variable_code_editor[
          `${variable_function_window.id}-textarea`
        ].getValue();

      if (variable_code == "") {
        /* E8: Variable hub variables have to have implementation. */
        syntax_check_failed = true;
        errors_returned.add(
          "E8: Variable hub variables have to have implementation.",
        );
      }

      if (
        !(
          /return\s+\S+/.test(variable_code) &&
          (variable_code.match(/return/g) || []).length === 1
        )
      ) {
        /* E9: Variable hub variables should have exactly one return statement. */
        syntax_check_failed = true;
        errors_returned.add(
          "E9: Variable hub variables should have exactly one return statement.",
        );
      }
    }
  }

  if (
    global_source_workspace === "verify-checksum" ||
    global_source_workspace === "compute-checksum"
  ) {
    let unspecified_dropbox = document
      .querySelectorAll(
        `div.drawflow-child#drawflow-${global_source_workspace}`,
      )[0]
      .querySelectorAll(`div.module_element.dropbox`);

    if (unspecified_dropbox.length) {
      /* E10: Action input arguments need to be provided. */
      syntax_check_failed = true;
      errors_returned.add("E10: Action input arguments need to be provided.");
    }

    let top_bar_elements = document.querySelectorAll(
      `[id^="module-element-top-bar-${global_source_workspace}"]`,
    );
    for (let top_bar_element of top_bar_elements) {
      console.log(
        top_bar_element.getAttribute("data-match-found"),
        top_bar_element.getAttribute("data-match-found") === "false",
      );
      if (top_bar_element.getAttribute("data-match-found") === "false") {
        /* E11: Action name has to exist in action page. */
        syntax_check_failed = true;
        errors_returned.add("E11: Action name has to exist in action page.");
      }
    }
  }

  if (
    global_source_workspace === "ingress" ||
    global_source_workspace === "egress"
  ) {
    /* E15: At least one action needs to be specified. */
    /* E16: No duplicate actions. */
    /* E17: There should be a default action for table. */
    // 1. Select elements based on the partial ID
    let elements = document.querySelectorAll(
      `div[id^="aux-module-element-top-bar-${global_source_workspace}"]`,
    );

    elements.forEach((element) => {
      // 2. Loop based on node-name (node-3, for example)
      let nodeMatches = element.id.match(/node-\d+/);
      if (nodeMatches) {
        let nodeValue = nodeMatches[0];

        // 3. Loop on the last word (size, for example)
        let lastWordMatches = element.id.match(/[^-]+$/); // Match the last word after a hyphen
        if (lastWordMatches) {
          let lastWord = lastWordMatches[0];
          if (lastWord === "size") {
            // Extract and check the size value
            let size_input = element.querySelector("input");
            const sizeValue = parseInt(size_input.value);

            if (
              !size_input.value ||
              isNaN(sizeValue) ||
              sizeValue < 1 ||
              sizeValue > 1024
            ) {
              /* E12: Table size needs to be specified, within range, and parseable. */
              syntax_check_failed = true;
              errors_returned.add(
                "E12: Table size needs to be specified, within range, and parseable.",
              );
            }
          }

          if (lastWord === "keys") {
            var unique_input_values = new Set();
            console.log(element, "lalala");
            element
              .querySelector(
                `div#table-key-pad-container-${global_source_workspace}-${nodeValue}`,
              )
              .querySelectorAll(`div.table-key`)
              .forEach((table_key) => {
                var input = table_key.querySelector("input");
                if (input.value == "") {
                  /* E13: Table keys need to have a valid name. */
                  syntax_check_failed = true;
                  errors_returned.add(
                    "E13: Table keys need to have a valid name.",
                  );
                }

                const parts = input.value.split(":");

                if (
                  parts.length !== 2 || // There should be exactly two parts
                  !parts[0].trim() || // table_key should not be empty after trimming spaces
                  !keyMatchingConditions.includes(parts[1].trim()) // The trimmed branch condition should be in our list
                ) {
                  /* E14: Table keys need to have a valid matching condition. */
                  syntax_check_failed = true;
                  errors_returned.add(
                    "E14: Table keys need to have a valid matching condition.",
                  );
                }

                if (unique_input_values.has(input.value)) {
                  /* E15: Table keys need to be unique. */
                  syntax_check_failed = true;
                } else {
                  unique_input_values.add(input.value);
                  errors_returned.add("E15: Table keys need to be unique.");
                }
              });
          }

          if (lastWord === "actions") {
            var unique_input_values = new Set();
            console.log(element, "lalala");
            element
              .querySelector(
                `div#table-action-pad-container-${global_source_workspace}-${nodeValue}`,
              )
              .querySelectorAll(`div.table-key`)
              .forEach((table_key) => {
                var input = table_key.querySelector("input");
                if (input.value == "") {
                  /* E16: Table actions need to have a valid name. */
                  syntax_check_failed = true;
                  errors_returned.add(
                    "E16: Table actions need to have a valid name.",
                  );
                }

                const parts = input.value.split(":");

                if (unique_input_values.has(input.value)) {
                  /* E17: Table actions need to be unique. */
                  syntax_check_failed = true;
                  errors_returned.add("E17: Table actions need to be unique.");
                } else {
                  unique_input_values.add(input.value);
                }
              });

            if (!element.querySelector("div.default-tab")) {
              /* E18: Table needs to have a default action. */
              syntax_check_failed = true;
              errors_returned.add("E18: Table needs to have a default action.");
            }
          }
        }
      }
    });
  }

  if (syntax_check_failed) {
    // Report all reasons for failure.
    updateStatusLight("red");
    return errors_returned;
  }

  /* Everything passes, update the status light to blue. */
  updateStatusLight("blue");
  return errors_returned;
}

function adjustWorkspaceWidth() {
  if (!display_code) {
    document.querySelector(".code-block-div").style.display = "none";
    document.getElementById(`drawflow-${global_source_workspace}`).style.width =
      "100%";
  } else {
    document.querySelector(".code-block-div").style.display = "block";
    document.getElementById(`drawflow-${global_source_workspace}`).style.width =
      "70%";
  }
  return;
}

function ToggleWorkspaceSearchBar() {
  /* 
     TODO:
     I am not doing anything for now, but my long term vision is 
     1. Bring up a search bar when the user presses Ctrl+F
     2. User should be able to search for the NAME of the module ONLY.
     3. While the user is typing, the search bar should be able to auto-suggest along the way.
     4. Once the correct module is located, we should jump to the location that contains the module.
  */
  return;
}

function ToggleControlVariables() {
  /* Turn off current variable hub and instantiate new ones, if needed. */
  if (variable_hub_enabled_dict[global_source_workspace]) {
    /* Turn off the current variable hub. */
    if (document.querySelector(`div#variable-hub-${global_source_workspace}`)) {
      document.querySelector(
        `div#variable-hub-${global_source_workspace}`,
      ).style.display = "none";
    }
  } else {
    /* Turn on the current variable hub. */
    if (document.querySelector(`div#variable-hub-${global_source_workspace}`)) {
      document.querySelector(
        `div#variable-hub-${global_source_workspace}`,
      ).style.display = "flex";
    }
  }
  variable_hub_enabled_dict[global_source_workspace] =
    !variable_hub_enabled_dict[global_source_workspace];
}

function addVariableToVariableHub() {
  /* Add a new variable to the variable hub. */
  /* We start with an empty variable element. */

  // Create the div element for a new variable
  const divElement = document.createElement("div");
  const workspace = global_source_workspace;
  const variable_count = variable_hub_variable_count[global_source_workspace];
  divElement.className = "variable-hub-variables draggable";
  divElement.id = `variable-hub-variable-${global_source_workspace}-${variable_hub_variable_count[global_source_workspace]}`;
  divElement.draggable = true;
  divElement.addEventListener("dragstart", function (event) {
    event.dataTransfer.setData("text/plain", this.querySelector("input").value);
  });
  // Attach an event listener to the div element
  divElement.addEventListener("click", function (event) {
    console.log(event.target.classList, event.target);
    if (
      event.target.classList.contains("fa-times-circle") &&
      event.target.id ===
        `variable-hub-variable-delete-icon-${workspace}-${variable_count}`
    ) {
      editVariableHubVariableHandler(this.id, event, "delete");
    } else if (
      event.target.classList.contains("variable-hub-variable-text-field")
    ) {
      editVariableHubVariableHandler(this.id, event, "text");
    } else {
      editVariableHubVariableHandler(this.id, event);
    }
  });

  // Create the input element
  const inputElement = document.createElement("input");
  inputElement.type = "text";
  inputElement.className = "variable-hub-variable-text-field";

  // Create the delete button
  const buttonElement = document.createElement("button");
  buttonElement.className = "variable-hub-variable-delete-button";

  // Create the Font Awesome icon for delete
  const iconElement = document.createElement("i");
  iconElement.className = "fa fa-times-circle";
  iconElement.style.position = "relative";
  iconElement.style.fontSize = "24px";
  iconElement.style.color = "red";
  iconElement.id = `variable-hub-variable-delete-icon-${workspace}-${variable_count}`;

  // Create a function window for users to specify values.
  const functionWindowElement = document.createElement("div");
  functionWindowElement.id = `variable-hub-variable-function-window-${global_source_workspace}-${variable_hub_variable_count[global_source_workspace]}`;
  functionWindowElement.className = "variable-hub-variable-function-window";
  functionWindowElement.style.position = "fixed";
  functionWindowElement.style.display = "none";
  functionWindowElement.style.width = "50%";
  functionWindowElement.style.height = "50%";
  functionWindowElement.style.top = "25%";
  functionWindowElement.style.left = "25%";
  functionWindowElement.style.border = "35px solid grey";
  functionWindowElement.style.borderRadius = "3%";

  // Create a text area before converting it to a CodeMirror instance.
  const textAreaElement = document.createElement("textarea");
  textAreaElement.id = `variable-hub-variable-function-window-${global_source_workspace}-${variable_hub_variable_count[global_source_workspace]}-textarea`;
  textAreaElement.style.position = "fixed";
  functionWindowElement.appendChild(textAreaElement);

  // Add another button to hide the function window.
  const hideButtonElement = document.createElement("button");
  hideButtonElement.className =
    "variable-hub-variable-function-window-hide-button";
  hideButtonElement.style.position = "absolute";
  hideButtonElement.innerHTML = `<i class="fa fa-times-circle" style="font-size:24px;color:red"></i>`;
  hideButtonElement.style.backgroundColor = "grey";
  hideButtonElement.style.padding = "0px";
  hideButtonElement.style.top = "-6%";
  hideButtonElement.style.right = "-3%";
  hideButtonElement.onclick = function (event) {
    document.querySelector(
      `div#variable-hub-variable-function-window-${workspace}-${variable_count}`,
    ).style.display = "none";
  };
  functionWindowElement.appendChild(hideButtonElement);

  // Append the icon to the button
  buttonElement.appendChild(iconElement);

  // Append the input and delete button to the div element
  divElement.appendChild(inputElement);
  divElement.appendChild(buttonElement);
  divElement.appendChild(functionWindowElement);

  // Append the div element to the variable hub
  document
    .querySelector(`div#variable-hub-${global_source_workspace}`)
    .appendChild(divElement);

  // Convert functionWindowElement into a CodeMirror instance.
  codeTextArea = document.getElementById(
    `variable-hub-variable-function-window-${global_source_workspace}-${variable_hub_variable_count[global_source_workspace]}-textarea`,
  );
  var editor = CodeMirror.fromTextArea(codeTextArea, {
    lineNumbers: true,
    tabSize: 2,
  });
  editor.setSize(null, "100%");
  editor.setFontSize = function (size) {
    var editorDiv = this.getWrapperElement();
    editorDiv.style.fontSize = size + "px";
  };

  editor.setFontSize(24);

  editor.setCaretColor = function (color) {
    var cursorStyle = document.createElement("style");
    document.head.appendChild(cursorStyle);
    cursorStyle.sheet.insertRule(
      `.CodeMirror-cursor { border-left: 1.4px solid ${color} !important; }`,
      0,
    );
  };

  editor.setCaretColor("lime");
  editor.getWrapperElement().classList.add("custom-codemirror-text-color");
  editor.getWrapperElement().classList.add("custom-background");

  var gutterElement = editor
    .getWrapperElement()
    .querySelector(".CodeMirror-gutters");
  if (gutterElement) {
    gutterElement.style.backgroundColor = "grey";
  }

  editor.refresh();
  local_variable_code_editor[codeTextArea.id] = editor;

  divElement.addEventListener("contextmenu", function (event) {
    // Prevent default action from triggering.
    event.preventDefault();
    // Bring up a new code window if the user `right clicks` on a variable.
    document.querySelector(
      `div#variable-hub-variable-function-window-${workspace}-${variable_count}`,
    ).style.display = "block";
  });

  // Increment the variable count
  variable_hub_variable_count[global_source_workspace] += 1;
  return;
}

function editVariableHubVariableHandler(variable_id, event, type = null) {
  if (type === "delete") {
    document.querySelector(`div#${variable_id}`).remove();
  }
  event.stopPropagation();
}

function sizeInputHandler(inputElement, workspace, selected_node_id) {
  inputElement.style.color = "#282828";
  inputElement.style.fontFamily = "Courier, monospace";
  inputElement.style.fontSize = "20px";

  function setBatteryLevel(level, workspace, selected_node_id) {
    if (level < 0 || level > 1024) {
      // Should tell users that the input is invalid. But I am too lazy to do it haha.
      return;
    }
    const maxLevel = 10;
    const batteryElement = document.getElementById(
      `battery-level-${workspace}-${selected_node_id}`,
    );
    const percentage = (Math.log2(level) / maxLevel) * 100;
    batteryElement.style.width = `${percentage}%`;
  }
  setBatteryLevel(parseInt(inputElement.value), workspace, selected_node_id);
}

function resizeDiv(inputValue, new_div, type = "Keys") {
  const inputLength = inputValue.length;
  if (type == "Keys") {
    new_div.style.width = Math.min(Math.max(300, inputLength * 15), 340) + "px"; // Updated maximum width to 340
  } else {
    new_div.style.width = Math.min(Math.max(300, inputLength * 15), 340) + "px"; // Updated maximum width to 340
  }
}

function addTableElements(element, workspace, variable_count, type = "Keys") {
  if (!element.dataset.hasListener) {
    element.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        addTableElements(element, workspace, variable_count, type);
        const inputs = Array.from(element.querySelectorAll("input"));
        const currentIndex = inputs.indexOf(event.target);
        if (currentIndex !== -1 && currentIndex < inputs.length - 1) {
          inputs[currentIndex + 1].focus();
        }
      }
    });
    element.dataset.hasListener = "true";
  }

  if (type == "Keys" && !element.dataset.hasOwnProperty(`numberOf${type}`)) {
    element.dataset.numberOfKeys = 0;
  } else if (
    type == "Actions" &&
    !element.dataset.hasOwnProperty(`numberOf${type}`)
  ) {
    element.dataset.numberOfActions = 0;
  }
  console.log(
    "line 2540",
    type,
    element.dataset.numberOfKeys,
    element.dataset.numberOfActions,
  );
  if (type == "Keys") {
    selection_number = element.dataset.numberOfKeys;
  } else {
    selection_number = element.dataset.numberOfActions;
  }
  const frozen_number = selection_number;
  const new_div = document.createElement("div");
  const input_element = document.createElement("input");

  new_div.className = "table-key";
  new_div.style.backgroundColor = "#4682B4";
  new_div.style.width = type == "Keys" ? "300px" : "300px";
  new_div.style.maxWidth = type == "Keys" ? "340px" : "340px";
  new_div.style.height = "40px";
  new_div.style.margin = "5px";
  new_div.style.borderRadius = "5px";
  new_div.style.display = "flex";
  new_div.style.alignItems = "center";
  new_div.style.justifyContent = "space-between";
  new_div.id = `table-${type}-${workspace}-${variable_count}-${frozen_number}`;

  input_element.style.flexGrow = "1";
  input_element.style.height = "80%";
  input_element.style.minWidth = "75px";
  input_element.style.backgroundColor = "transparent";
  input_element.style.color = "#c8c8c8";
  input_element.style.border = "none";
  input_element.style.fontFamily = "Courier, monospace";

  // Create Default tab, initially hidden
  const defaultTab = document.createElement("div");
  defaultTab.style.display = "none"; // Initially hidden
  defaultTab.textContent = "Default";
  defaultTab.className = "default-tab";

  // Listen for the 'Tab' key press for auto-completion.
  element.addEventListener("keydown", function (event) {
    if (event.key === "Tab") {
      event.preventDefault(); // Prevent the default tab key behavior

      const suggestedWord = event.target.dataset.suggestedWord;

      if (suggestedWord) {
        let inputValue = event.target.value;

        // If there are spaces in the input, keep everything before the last space
        if (inputValue.includes(" ")) {
          let splitValues = inputValue.split(" ");
          splitValues.pop(); // Remove the last element, which we will replace with the suggested word
          splitValues.push(suggestedWord); // Add the suggested word as the last element
          event.target.value = splitValues.join(" "); // Join the array back into a string
        } else {
          // If no spaces, simply replace the entire input value
          event.target.value = suggestedWord;
        }
      }

      // Turn off auto-suggest
      autoCompleteSpan.style.display = "none";

      // Resize the div after auto-completing
      resizeDiv(event.target.value, new_div, type);
    }
  });

  // Listen to input suggestions, and offer auto-suggest if necessary.
  element.addEventListener("input", function (event) {
    let inputValue = event.target.value;
    if (inputValue.includes(" ")) {
      splitValues = inputValue.split(" ");
      if (splitValues[splitValues.length - 1] == "") {
        inputValue = null;
      } else {
        inputValue = splitValues[splitValues.length - 1];
      }
    }

    // Reset the suggested word data attribute on every input
    event.target.dataset.suggestedWord = "";

    // Check if any word in autoCompleteData starts with the input value
    for (let word of autoCompleteData) {
      if (word.startsWith(inputValue)) {
        // Store the current suggested word in the data attribute
        event.target.dataset.suggestedWord = word;
        // Display the suggestion in some manner (e.g., as a placeholder)
        event.target.placeholder = word;
        console.log(
          "in here!",
          event.target.dataset.suggestedWord,
          event.target.placeholder,
        );
        break;
      }
    }

    if (!new_div.dataset.hasContextListener) {
      new_div.addEventListener("contextmenu", function (event) {
        event.preventDefault();
        if (type === "Actions") {
          const tab = this.querySelector(".default-tab");
          if (tab.style.display === "none") {
            // Cancel all other tabs from displaying, if applicable.
            const tabs = document.querySelectorAll(".default-tab");
            tabs.forEach((tab) => {
              // find parent div of tab and change width back to where it was.
              const parent_div = tab.parentNode;
              if (tab.style.display == "flex") {
                parent_div.style.width = `${parent_div.style.width - 50}px`;
                tab.style.display = "none";
              }
            });
            tab.style.display = "flex";
            new_div.style.width = `${new_div.style.width + 50}px`;
          } else {
            tab.style.display = "none";
            new_div.style.width = `${new_div.style.width - 50}px`;
          }
        }
      });
      new_div.dataset.hasContextListener = "true";
    }

    const suggestedWord = event.target.dataset.suggestedWord;

    if (suggestedWord && event.target.value != suggestedWord) {
      autoCompleteSpan.style.display = "inline-block";
      autoCompleteSpan.textContent = "↹ " + suggestedWord;
    } else {
      autoCompleteSpan.style.display = "none"; // Hide if no suggestion
    }
  });

  // Dynamically adjust the width of the div based on the input length
  input_element.addEventListener("input", function () {
    // Resize the div after auto-completing
    resizeDiv(this.value, new_div, type);
  });

  new_div.appendChild(input_element);

  // Create the delete button
  const buttonElement = document.createElement("button");
  buttonElement.className = `table-${type}-delete-button`;
  buttonElement.style.backgroundColor = "transparent";
  buttonElement.style.border = "none";
  buttonElement.onclick = function () {
    document
      .querySelector(
        `div#table-${type}-${workspace}-${variable_count}-${frozen_number}`,
      )
      .remove();
  };
  // Create the Font Awesome icon for delete
  const iconElement = document.createElement("i");
  iconElement.className = "fa fa-times-circle";
  iconElement.style.fontSize = "20px";
  iconElement.style.color = "red";
  iconElement.id = `table-${type}-delete-icon-${workspace}-${variable_count}-${frozen_number}`;

  buttonElement.appendChild(iconElement);
  new_div.appendChild(buttonElement);
  // Add the default tab
  new_div.appendChild(defaultTab);

  // Create a span element for autocomplete suggestions
  const autoCompleteSpan = document.createElement("span");
  autoCompleteSpan.className = "auto-complete-span";
  autoCompleteSpan.style.position = "absolute";
  autoCompleteSpan.style.left = "0";
  autoCompleteSpan.style.bottom = "0";
  autoCompleteSpan.style.backgroundColor = "#ccc";
  autoCompleteSpan.style.display = "none";
  new_div.appendChild(autoCompleteSpan);

  // Add an event listener to the div element for on clicks.
  new_div.addEventListener("click", function (event) {
    event.stopPropagation();
  });

  element.appendChild(new_div);
  if (type == "Keys") {
    element.dataset.numberOfKeys++;
  } else {
    element.dataset.numberOfActions++;
  }
  return;
}

function addWorkspaceTransitionButtonClickHandler(
  mode,
  source_workspace,
  target_workspace,
) {
  // Listen to html_post node by adding an event listener.
  var isDragging = false;

  transition_node = document.querySelector(
    `div.drawflow-node.generic.${source_workspace}.${mode}`,
  );
  transition_node.addEventListener("mousedown", function () {
    isDragging = false; // reset the dragging flag on mousedown
  });

  transition_node.addEventListener("mousemove", function () {
    isDragging = true; // if mouse moved, set the dragging flag
  });

  transition_node.addEventListener("mouseup", function (event) {
    if (!isDragging) {
      // If the mouse hasn't moved much, treat it as a click
      controlSwitch(target_workspace);
      transition_node.classList.remove("selected");
    }
  });

  transition_node.style.cursor = "pointer"; // Use 'cursor' instead of 'cursorStyle'
}

function bezierDerivative(t, P0, P1, P2, P3) {
  // Calculate the derivative of Bézier curve
  const dBx_dt =
    3 * Math.pow(1 - t, 2) * (P1.x - P0.x) +
    6 * (1 - t) * t * (P2.x - P1.x) +
    3 * t * t * (P3.x - P2.x);
  const dBy_dt =
    3 * Math.pow(1 - t, 2) * (P1.y - P0.y) +
    6 * (1 - t) * t * (P2.y - P1.y) +
    3 * t * t * (P3.y - P2.y);
  return dBy_dt / dBx_dt;
}

function bezierPoint(t, P0, P1, P2, P3) {
  const x =
    Math.pow(1 - t, 3) * P0.x +
    3 * Math.pow(1 - t, 2) * t * P1.x +
    3 * (1 - t) * t * t * P2.x +
    t * t * t * P3.x;
  const y =
    Math.pow(1 - t, 3) * P0.y +
    3 * Math.pow(1 - t, 2) * t * P1.y +
    3 * (1 - t) * t * t * P2.y +
    t * t * t * P3.y;
  return { x, y };
}

function bezierPointCenterDiff(t, P0, P1, P2, P3) {
  let { x, y } = bezierPoint(t, P0, P1, P2, P3);
  let { x: center_x, y: center_y } = bezierPoint(0.5, P0, P1, P2, P3);
  return { x: x - center_x, y: y - center_y };
}

function findHorizontalRegions(P0, P1, P2, P3, samples = 10) {
  // find the difference between t and t=0.5
  const tValues = Array(samples)
    .fill(0)
    .map((_, i) => i / (samples - 1));
  const horizontalRegions = [];
  for (let t of tValues) {
    if (
      Math.abs(bezierDerivative(t, P0, P1, P2, P3)) > 0 &&
      Math.abs(bezierDerivative(t, P0, P1, P2, P3)) < 0.5
    ) {
      horizontalRegions.push(t);
    }
  }
  return horizontalRegions.map((t) => bezierPointCenterDiff(t, P0, P1, P2, P3));
}

function attachSVGDisplayBox(query_id) {
  let outerdiv = document.createElement("div");
  outerdiv.classList.add(`side-by-side-div-${query_id}`);

  var div1 = document.createElement("div");
  var div2 = document.createElement("div");
  var div3 = document.createElement("div");
  var div4 = document.createElement("div");

  div1.classList.add(`side-by-side-div-${query_id}-switch-head`);
  div2.classList.add(`side-by-side-div-${query_id}-switch-target`);
  div3.classList.add(`side-by-side-div-${query_id}-field3`);
  div4.classList.add(`side-by-side-div-${query_id}-field4`);
  subdivs = [div1, div2, div3, div4];

  outerdiv.appendChild(div1);
  outerdiv.appendChild(div2);
  outerdiv.appendChild(div3);
  outerdiv.appendChild(div4);

  // Some style parameters. I know I am not allowed to do it here, but come on!
  outerdiv.style.backgroundColor = "#B5E6E9";
  outerdiv.style.border = "1px solid #aaa";
  outerdiv.style.width = "auto";
  outerdiv.style.height = "auto";
  outerdiv.style.padding = "5px 10px";
  outerdiv.style.display = "inline-flex";
  outerdiv.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  outerdiv.style.fontSize = "14px";
  outerdiv.style.fontWeight = "normal";
  outerdiv.style.position = "absolute";
  outerdiv.style.borderRadius = "5px";
  outerdiv.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
  outerdiv.style.textAlign = "center";

  return outerdiv;
}

function updateStatusLight(status) {
  document.querySelector(
    `div#${global_source_workspace}-status-circle-lime`,
  ).style.display = status === "lime" ? "inline-block" : "none";
  document.querySelector(
    `div#${global_source_workspace}-status-circle-yellow`,
  ).style.display = status === "yellow" ? "inline-block" : "none";
  document.querySelector(
    `div#${global_source_workspace}-status-circle-red`,
  ).style.display = status === "red" ? "inline-block" : "none";
  document.querySelector(
    `div#${global_source_workspace}-status-circle-blue`,
  ).style.display = status === "blue" ? "inline-block" : "none";
}

function checkIllegalInputNames(name) {
  // List of JavaScript reserved keywords. You might want to expand this list
  // based on your specific use case or the programming language in focus.
  const RESERVED_KEYWORDS = [
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "debugger",
    "default",
    "delete",
    "do",
    "else",
    "export",
    "extends",
    "finally",
    "for",
    "function",
    "if",
    "import",
    "in",
    "instanceof",
    "new",
    "return",
    "super",
    "switch",
    "this",
    "throw",
    "try",
    "typeof",
    "var",
    "void",
    "while",
    "with",
    "yield",
  ];

  // Check if the name is a reserved keyword
  if (RESERVED_KEYWORDS.includes(name)) {
    return [false, `${name} is a reserved keyword.`];
  }

  // Use a regular expression to check the validity based on character rules
  // Updated to only allow variable names starting with letters
  const isValid =
    /^[a-zA-Z][a-zA-Z0-9_]*$/.test(name) && name.trim().split(" ").length == 1;
  return [isValid, isValid ? `${name} is an invalid variable name.` : "OK"];
}

function closeIDEHelp() {
  var element = document.querySelector("div.ide-help-page");
  element.style.display = "none";
}

function openIDEHelp() {
  var element = document.querySelector("div.ide-help-page");
  element.style.display = "block";
}

function displayErrors(errors) {
  const popup = document.getElementById(
    `error-popup-${global_source_workspace}`,
  );
  const errorList = document.getElementById(
    `error-list-${global_source_workspace}`,
  );
  const errorDetails = document.getElementById(
    `error-details-${global_source_workspace}`,
  );
  if (errorDetails) errorDetails.style.display = "block";
  if (errorList) errorList.style.display = "none";

  const errorCount = errorDetails.querySelector(
    `#error-count-${global_source_workspace}`,
  );
  const expandDetails = errorDetails.querySelector(
    `#expand-details-${global_source_workspace}`,
  );

  if (errors.size > 0) {
    errorCount.innerHTML =
      errors.size > 1
        ? `${errors.size} errors reported.`
        : `${errors.size} error reported.`;
    expandDetails.style.display = "block";
    popup.querySelector(`#fail-icon-${global_source_workspace}`).style.display =
      "block";
    popup.querySelector(`#pass-icon-${global_source_workspace}`).style.display =
      "none";
  } else {
    errorCount.innerHTML = "No errors reported.";
    expandDetails.style.display = "none";
    popup.querySelector(`#pass-icon-${global_source_workspace}`).style.display =
      "block";
    popup.querySelector(`#fail-icon-${global_source_workspace}`).style.display =
      "none";
  }

  // Populate the error list
  errorList.innerHTML = ""; // Clear any previous errors
  errors.forEach((error) => {
    let li = document.createElement("li");
    li.textContent = error;
    errorList.appendChild(li);
  });

  // Show the popup
  popup.classList.remove("popup-hidden");

  // Set a timeout to hide the popup after X seconds (e.g., 5 seconds)
  // Deprecate timeout for now.
  if (errors.size === 0) {
    setTimeout(closePopup, 2000);
  }

  // Expand errors on click
  popup.onclick = () => {
    // Add your expand logic here, for simplicity, I'm just toggling a 'large' class
    popup.classList.toggle("large");
  };
}

function closePopup() {
  document
    .getElementById(`error-popup-${global_source_workspace}`)
    .classList.add("popup-hidden");
}

/* One time function to expand the error list. 
   In other words, this function self-destructs after it is called once. */
function toggleErrorDetails() {
  const errorList = document.getElementById(
    `error-list-${global_source_workspace}`,
  );
  const errorDetails = document.getElementById(
    `error-details-${global_source_workspace}`,
  );

  if (errorList.style.display === "none" || errorList.style.display === "") {
    errorList.style.display = "block";
    if (errorDetails) errorDetails.style.display = "none";
  }
}

function goToPageNumber(page_number) {
  const iframe = document.querySelector("iframe"); // Adjust selector if needed
  const baseUrl =
    "https://docs.google.com/presentation/d/e/2PACX-1vSycOeJbedk_KWkWKAAXIOz2KWN_FwuvmuwIHwVvLRpnIRDuSE6Go3gRC0qs8IMnQ/embed?";
  const params = "start=false&loop=false&delayms=10000";
  iframe.src = `${baseUrl}${params}&slide=id.p${page_number}`;
}
