(() => {
  window.addEventListener("beforeunload", function (e) {
    e.preventDefault();
    e.returnValue = ""; // Zorgt dat de browser de bevestigingsprompt toont
  });
})();
