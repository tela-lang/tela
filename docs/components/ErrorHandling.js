
const ErrorHandling = Tela.defineComponent({
  name: 'ErrorHandling',
  
  
  setup(instance) {
    const state_ErrorHandling = Tela.reactive({
      tryCatchCode: "",
      throwCode: ""
    }, instance.update, {});

    

    

    const navigate = (dest) => {
      window.history.pushState(null, '', dest);
      window.dispatchEvent(new PopStateEvent('popstate'));
    };

    

    

    

    // onMount
    state_ErrorHandling.tryCatchCode = window.TELA_DOCS.tryCatchCode;
      state_ErrorHandling.throwCode = window.TELA_DOCS.throwCode;

    return () => {
      
      return Tela.element('div', {  }, [Tela.element('h1', { 'class': "tela-ErrorHandling-h1-0" }, ["Error Handling"]), Tela.element('div', { 'class': "tela-ErrorHandling-div-1" }, [""]), Tela.element('p', { 'class': "tela-ErrorHandling-p-2" }, ["Tela supports try / catch / finally and throw — the same error-handling constructs you know from Java and JavaScript."]), Tela.element('h2', { 'class': "tela-ErrorHandling-h2-3" }, ["try / catch / finally"]), Tela.element('p', { 'class': "tela-ErrorHandling-p-4" }, ["Wrap async API calls in try/catch to handle network errors gracefully. The finally block always runs, making it perfect for clearing a loading flag."]), Tela.element('div', { 'class': "tela-ErrorHandling-div-5" }, [Tela.element('pre', { 'class': "tela-ErrorHandling-pre-6" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_ErrorHandling.tryCatchCode}`])])]), Tela.element('h2', { 'class': "tela-ErrorHandling-h2-7" }, ["throw"]), Tela.element('p', { 'class': "tela-ErrorHandling-p-8" }, ["Use throw to signal validation failures or other unrecoverable conditions. You can throw a string, an Error object, or any value."]), Tela.element('div', { 'class': "tela-ErrorHandling-div-9" }, [Tela.element('pre', { 'class': "tela-ErrorHandling-pre-10" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_ErrorHandling.throwCode}`])])]), Tela.element('h2', { 'class': "tela-ErrorHandling-h2-11" }, ["Best Practices"]), Tela.element('div', { 'class': "tela-ErrorHandling-div-12" }, [Tela.element('div', { 'class': "tela-ErrorHandling-div-13" }, [Tela.element('div', { 'class': "tela-ErrorHandling-div-14" }, ["Always use finally to clear loading flags"]), Tela.element('div', { 'class': "tela-ErrorHandling-div-15" }, ["Put loading = false in finally so the spinner disappears even when the request fails."])]), Tela.element('div', { 'class': "tela-ErrorHandling-div-16" }, [Tela.element('div', { 'class': "tela-ErrorHandling-div-17" }, ["Store errors in state"]), Tela.element('div', { 'class': "tela-ErrorHandling-div-18" }, ["Declare state error: String = '' and display it with if (error !== '') so users see a friendly message instead of a blank screen."])]), Tela.element('div', { 'class': "tela-ErrorHandling-div-19" }, [Tela.element('div', { 'class': "tela-ErrorHandling-div-20" }, ["Reset error before each request"]), Tela.element('div', { 'class': "tela-ErrorHandling-div-21" }, ["Set error = '' at the top of your async function so stale error messages from previous calls don't linger."])])])]);
    };
  }
});

(function(){
  if (typeof window !== 'undefined') {
    window.ErrorHandling = ErrorHandling;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ErrorHandling };
  }
})();