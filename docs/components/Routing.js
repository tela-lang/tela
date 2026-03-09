
const Routing = Tela.defineComponent({
  name: 'Routing',
  
  
  setup(instance) {
    const state_Routing = Tela.reactive({
      routingCode: "",
      routingCustomNavigateCode: ""
    }, instance.update, {});

    

    

    

    // onMount
    state_Routing.routingCode = window.TELA_DOCS.routingCode;
      state_Routing.routingCustomNavigateCode = window.TELA_DOCS.routingCustomNavigateCode;

    return () => {
      
      return Tela.element('div', {  }, [Tela.element('h1', { 'class': "tela-Routing-h1-0" }, ["Routing"]), Tela.element('div', { 'class': "tela-Routing-div-1" }, [""]), Tela.element('p', { 'class': "tela-Routing-p-2" }, ["Tela has built-in client-side routing via the route keyword. Declare a route variable and use switch in the view to render the right component for the current URL."]), Tela.element('h2', { 'class': "tela-Routing-h2-3" }, ["Basic routing"]), Tela.element('p', { 'class': "tela-Routing-p-4" }, ["The route keyword creates a reactive variable that mirrors window.location.pathname. The compiler injects a navigate() helper automatically."]), Tela.element('div', { 'class': "tela-Routing-div-5" }, [Tela.element('pre', { 'class': "tela-Routing-pre-6" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_Routing.routingCode}`])])]), Tela.element('h2', { 'class': "tela-Routing-h2-7" }, ["How it works"]), Tela.element('div', { 'class': "tela-Routing-div-8" }, [Tela.element('div', { 'class': "tela-Routing-div-9" }, [Tela.element('div', { 'class': "tela-Routing-div-10" }, ["1"]), Tela.element('div', {  }, [Tela.element('div', { 'class': "tela-Routing-div-11" }, ["Initialised from the URL"]), Tela.element('div', { 'class': "tela-Routing-div-12" }, ["The route variable is set to window.location.pathname when the component mounts, so deep links work immediately."])])]), Tela.element('div', { 'class': "tela-Routing-div-13" }, [Tela.element('div', { 'class': "tela-Routing-div-14" }, ["2"]), Tela.element('div', {  }, [Tela.element('div', { 'class': "tela-Routing-div-15" }, ["navigate() pushes to history"]), Tela.element('div', { 'class': "tela-Routing-div-16" }, ["Calling navigate("/path") calls history.pushState and updates the route variable, triggering a re-render."])])]), Tela.element('div', { 'class': "tela-Routing-div-17" }, [Tela.element('div', { 'class': "tela-Routing-div-18" }, ["3"]), Tela.element('div', {  }, [Tela.element('div', { 'class': "tela-Routing-div-19" }, ["Back and forward buttons work"]), Tela.element('div', { 'class': "tela-Routing-div-20" }, ["A popstate listener keeps the route variable in sync with the browser history. It is removed automatically when the component is destroyed."])])])]), Tela.element('h2', { 'class': "tela-Routing-h2-21" }, ["Custom navigate"]), Tela.element('p', { 'class': "tela-Routing-p-22" }, ["If you define your own function navigate(...), the compiler skips injection. This lets you add custom logic such as scroll-to-top or analytics."]), Tela.element('div', { 'class': "tela-Routing-div-23" }, [Tela.element('pre', { 'class': "tela-Routing-pre-24" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_Routing.routingCustomNavigateCode}`])])]), Tela.element('h2', { 'class': "tela-Routing-h2-25" }, ["Server-side fallback"]), Tela.element('p', { 'class': "tela-Routing-p-26" }, ["For direct URL access (deep links), the server must return index.html for all application routes. In Spring Boot:"]), Tela.element('div', { 'class': "tela-Routing-div-27" }, [Tela.element('pre', { 'class': "tela-Routing-pre-28" }, [Tela.element('code', { 'class': "language-java" }, ["@GetMapping({"/", "/about", "/blog"})
public String index() { return "index"; }"])])]), Tela.element('div', { 'class': "tela-Routing-div-29" }, [Tela.element('div', { 'class': "tela-Routing-div-30" }, ["One route per component"]), Tela.element('div', { 'class': "tela-Routing-div-31" }, ["A component may declare at most one route variable. Route is designed for top-level application shell components."])])]);
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