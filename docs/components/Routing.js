
const Routing = Tela.defineComponent({
  name: 'Routing',
  
  
  setup(instance) {
    const state_Routing = Tela.reactive({
      routingCode: "",
      routingParamsCode: "",
      routingCustomNavigateCode: "",
      routingJavaCode: "",
      navigateAllCode: ""
    }, instance.update, {});

    

    

    const navigate = (dest) => {
      window.history.pushState(null, '', dest);
      window.dispatchEvent(new PopStateEvent('popstate'));
    };

    

    

    

    // onMount
    state_Routing.routingCode = window.TELA_DOCS.routingCode;
      state_Routing.routingParamsCode = window.TELA_DOCS.routingParamsCode;
      state_Routing.routingCustomNavigateCode = window.TELA_DOCS.routingCustomNavigateCode;
      state_Routing.routingJavaCode = window.TELA_DOCS.routingJavaCode;
      state_Routing.navigateAllCode = window.TELA_DOCS.navigateAllCode;

    return () => {
      
      return Tela.element('div', {  }, [Tela.element('h1', { 'class': "tela-Routing-h1-0" }, ["Routing"]), Tela.element('div', { 'class': "tela-Routing-div-1" }, [""]), Tela.element('p', { 'class': "tela-Routing-p-2" }, ["Tela has built-in client-side routing. Declare a route variable and use switch in the view to render the right component for the current URL. navigate() is auto-injected into every component — no route declaration needed to trigger navigation from child components."]), Tela.element('h2', { 'class': "tela-Routing-h2-3" }, ["Basic routing"]), Tela.element('p', { 'class': "tela-Routing-p-4" }, ["The route keyword creates a reactive variable that mirrors window.location.pathname. The compiler injects a navigate() helper automatically."]), Tela.element('div', { 'class': "tela-Routing-div-5" }, [Tela.element('pre', { 'class': "tela-Routing-pre-6" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_Routing.routingCode}`])])]), Tela.element('h2', { 'class': "tela-Routing-h2-7" }, ["Route parameters"]), Tela.element('p', { 'class': "tela-Routing-p-8" }, ["Add a second route params: Object declaration to capture named URL segments. The compiler extracts the patterns from your switch cases and matches them at runtime."]), Tela.element('div', { 'class': "tela-Routing-div-9" }, [Tela.element('pre', { 'class': "tela-Routing-pre-10" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_Routing.routingParamsCode}`])])]), Tela.element('h2', { 'class': "tela-Routing-h2-11" }, ["How it works"]), Tela.element('div', { 'class': "tela-Routing-div-12" }, [Tela.element('div', { 'class': "tela-Routing-div-13" }, [Tela.element('div', { 'class': "tela-Routing-div-14" }, ["1"]), Tela.element('div', {  }, [Tela.element('div', { 'class': "tela-Routing-div-15" }, ["Initialised from the URL"]), Tela.element('div', { 'class': "tela-Routing-div-16" }, ["The route variable is set to window.location.pathname when the component mounts, so deep links work immediately."])])]), Tela.element('div', { 'class': "tela-Routing-div-17" }, [Tela.element('div', { 'class': "tela-Routing-div-18" }, ["2"]), Tela.element('div', {  }, [Tela.element('div', { 'class': "tela-Routing-div-19" }, ["navigate() pushes to history"]), Tela.element('div', { 'class': "tela-Routing-div-20" }, ["Calling navigate('/path') calls history.pushState and updates the route variable, triggering a re-render."])])]), Tela.element('div', { 'class': "tela-Routing-div-21" }, [Tela.element('div', { 'class': "tela-Routing-div-22" }, ["3"]), Tela.element('div', {  }, [Tela.element('div', { 'class': "tela-Routing-div-23" }, ["Back and forward buttons work"]), Tela.element('div', { 'class': "tela-Routing-div-24" }, ["A popstate listener keeps the route variable in sync with the browser history. It is removed automatically when the component is destroyed."])])])]), Tela.element('h2', { 'class': "tela-Routing-h2-25" }, ["navigate() in any component"]), Tela.element('p', { 'class': "tela-Routing-p-26" }, ["The compiler injects navigate() into every component automatically — not just the root App. Any button, card, or list row can call navigate() directly without receiving it as a prop."]), Tela.element('div', { 'class': "tela-Routing-div-27" }, [Tela.element('pre', { 'class': "tela-Routing-pre-28" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_Routing.navigateAllCode}`])])]), Tela.element('div', { 'class': "tela-Routing-div-29" }, [Tela.element('div', { 'class': "tela-Routing-div-30" }, ["Simpler parent components"]), Tela.element('div', { 'class': "tela-Routing-div-31" }, ["Because navigate() is always available, you no longer need to thread navigation callbacks through props from App down to deeply nested child components."])]), Tela.element('h2', { 'class': "tela-Routing-h2-32" }, ["Custom navigate"]), Tela.element('p', { 'class': "tela-Routing-p-33" }, ["If you define your own function navigate(...), the compiler skips injection. This lets you add custom logic such as scroll-to-top or analytics."]), Tela.element('div', { 'class': "tela-Routing-div-34" }, [Tela.element('pre', { 'class': "tela-Routing-pre-35" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_Routing.routingCustomNavigateCode}`])])]), Tela.element('h2', { 'class': "tela-Routing-h2-36" }, ["Server-side fallback"]), Tela.element('p', { 'class': "tela-Routing-p-37" }, ["For direct URL access (deep links), the server must return index.html for all application routes. In Spring Boot:"]), Tela.element('div', { 'class': "tela-Routing-div-38" }, [Tela.element('pre', { 'class': "tela-Routing-pre-39" }, [Tela.element('code', { 'class': "language-java" }, [`${state_Routing.routingJavaCode}`])])]), Tela.element('div', { 'class': "tela-Routing-div-40" }, [Tela.element('div', { 'class': "tela-Routing-div-41" }, ["At most two route declarations"]), Tela.element('div', { 'class': "tela-Routing-div-42" }, ["A component may declare at most two route variables: one String for the matched path pattern, and one Object for URL parameters. Route is intended for top-level app shell components."])])]);
    };
  }
});

(function(){
  if (typeof window !== 'undefined') {
    window.Routing = Routing;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Routing };
  }
})();