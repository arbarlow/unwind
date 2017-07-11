// becuase a library is probably overkill
document.addEventListener("DOMContentLoaded", function() {
  ready();
});

// session vars
var sessionID = "";
var firstKeypress = null;
var viewport = { width: window.innerWidth, height: window.innerHeight };

// start the session
const ready = function() {
  sessionID = guid();

  // event listeners
  window.addEventListener("resize", debounce(() => onResize(), 400, false));
  window.addEventListener("paste", onPaste);
  window.addEventListener(
    "keypress",
    () => (firstKeypress = new Date().getTime())
  );

  document.querySelectorAll("form")[0].addEventListener("submit", e => {
    e.preventDefault();
    onSubmit(e);
  });
};

const onResize = () => {
  const prev = viewport;
  viewport = { width: window.innerWidth, height: window.innerHeight };
  updateState("resize", { resize_from: prev, resize_to: viewport });
};

const onPaste = e => {
  copy_and_paste = {};
  copy_and_paste[e.target.id] = true;
  paste = { copy_and_paste };
  updateState("paste", paste);
};

const onSubmit = e => {
  updateState("submit", {
    form_completion_time: new Date().getTime() - firstKeypress
  });
};

// utilities
const updateState = (event, data) => {
  data["session_id"] = sessionID;
  data["website_url"] = window.location.href;

  event = {
    event: event,
    data: data
  };

  fetch("/update", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(event)
  }).then(res => console.log(res));
};

function guid() {
  return (
    s4() +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    s4() +
    s4()
  );
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

const debounce = (func, wait, immediate) => {
  var timeout;
  return () => {
    const context = this,
      args = [func, wait, immediate];
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};
