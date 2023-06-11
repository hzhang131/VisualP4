let height = 0;
let global_editor = [null];
let global_editor_values = [null];
let current_input = null;
current_selected_window = 0;
let fileCount = 0; 
window.addEventListener('DOMContentLoaded', function() {
    var codeTextArea = document.getElementById('code');
    height = window.innerHeight;
    var minLines = Math.trunc(height * 0.8 / 15) + 3; 
    var startingValue = "/**\nWelcome to the VisualP4 IDE!\n**/";
    for (var i = 0; i < minLines; i++) {
        startingValue += '\n';
    }
    
    var editor = CodeMirror.fromTextArea(codeTextArea, {
      lineNumbers: true,
      tabSize: 2,
    });
  
    editor.setValue(startingValue);
    global_editor[current_selected_window] = editor;
  });

function reportWindowSize(){
    if (height != window.innerHeight) {
        if (global_editor[current_selected_window]){
            string = global_editor[current_selected_window].getValue().split("\n");
            string = string.slice(1);
            string = string.join('');
            set = new Set(string);
            if (string.size == 1){
                var minLines = Math.trunc(window.innerHeight * 0.8 / 15) + 3;
                var startingValue = "/**\nWelcome to the VisualP4 IDE!\n**/";
                for (var i = 0; i < minLines; i++) {
                    startingValue += '\n';
                }
                global_editor[current_selected_window].setValue(startingValue);
            } 
        }
        height = window.innerHeight;
        console.log(height);
    }
}

function captureCode(){
    if (global_editor[current_selected_window]){
        if (global_editor_values[current_selected_window] != global_editor[current_selected_window].getValue()){
            global_editor_values[current_selected_window] = global_editor[current_selected_window].getValue();
            console.log(global_editor_values[current_selected_window].length);
        }
    }
}

function createFileTabs(){
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
window.addEventListener("resize", reportWindowSize);
window.addEventListener("keydown", captureCode);

