
const App = Tela.defineComponent({
  name: 'App',
  
  
  setup(instance) {
    const state_App = Tela.reactive({
      page: "introduction",
      sidebarOpen: false
    }, instance.update, {});

    

    

    const navigate = (dest) => {
      window.history.pushState(null, '', dest);
      window.dispatchEvent(new PopStateEvent('popstate'));
    };

    

    

    const nav = (p) => {
      state_App.page = p;
      state_App.sidebarOpen = false;
      window.scrollTo(0, 0);
    };

    const toggleSidebar = () => {
      state_App.sidebarOpen = (!state_App.sidebarOpen);
    };

    

    return () => {
      
      return Tela.element('div', { 'class': "tela-App-div-0" }, [Tela.element('header', { 'class': "tela-App-header-1" }, [Tela.element('div', { 'class': "tela-App-div-2" }, [Tela.element('span', { 'class': "tela-App-span-3" }, ["Tela"]), Tela.element('span', { 'class': "tela-App-span-4" }, ["v0.3.0"])]), Tela.element('div', { 'class': "tela-App-div-5" }, [Tela.element('a', { 'class': "tela-App-a-6", 'href': "https://github.com/tela-lang/tela" }, ["GitHub"]), Tela.element('a', { 'class': "tela-App-a-7", 'href': "https://www.npmjs.com/package/@tela-lang/tela" }, ["npm"]), Tela.element('button', { 'class': "tela-App-button-8", 'onclick': (e) => { nav("introduction"); } }, ["Docs"])]), Tela.element('button', { 'class': "tela-App-button-9", 'onclick': toggleSidebar }, [(state_App.sidebarOpen ? "✕" : "☰")])]), ((state_App.page === "hero")) ? [Tela.element(Hero, { 'onStart': nav }, [])] : [Tela.element('div', { 'class': "tela-App-div-10" }, [Tela.element('div', { 'class': "tela-App-div-11", 'style': { 'display': (state_App.sidebarOpen ? "block" : "none") }, 'onclick': toggleSidebar }, []), Tela.element(Sidebar, { 'activePage': state_App.page, 'onNav': nav, 'isOpen': state_App.sidebarOpen }, []), Tela.element('div', { 'class': "tela-App-div-12" }, [((_d) => (_d === "introduction") ? [Tela.element(Introduction, {  }, [])] : (_d === "getting-started") ? [Tela.element(GettingStarted, {  }, [])] : (_d === "component-anatomy") ? [Tela.element(ComponentAnatomy, {  }, [])] : (_d === "reactive-state") ? [Tela.element(ReactiveState, {  }, [])] : (_d === "props") ? [Tela.element(PropsSection, {  }, [])] : (_d === "template-syntax") ? [Tela.element(TemplateSyntax, {  }, [])] : (_d === "enums-models") ? [Tela.element(EnumsModels, {  }, [])] : (_d === "events") ? [Tela.element(EventsSection, {  }, [])] : (_d === "control-flow") ? [Tela.element(ControlFlow, {  }, [])] : (_d === "switch-case") ? [Tela.element(SwitchCase, {  }, [])] : (_d === "loops") ? [Tela.element(Loops, {  }, [])] : (_d === "two-way-binding") ? [Tela.element(TwoWayBinding, {  }, [])] : (_d === "error-handling") ? [Tela.element(ErrorHandling, {  }, [])] : (_d === "async-data") ? [Tela.element(AsyncData, {  }, [])] : (_d === "null-safety") ? [Tela.element(NullSafety, {  }, [])] : (_d === "routing") ? [Tela.element(Routing, {  }, [])] : (_d === "global-store") ? [Tela.element(GlobalStore, {  }, [])] : (_d === "child-components") ? [Tela.element(ChildComponents, {  }, [])] : (_d === "lifecycle") ? [Tela.element(Lifecycle, {  }, [])] : (_d === "spring-boot") ? [Tela.element(SpringBoot, {  }, [])] : (_d === "dev-server") ? [Tela.element(DevServer, {  }, [])] : (_d === "language-spec") ? [Tela.element(LanguageSpec, {  }, [])] : [Tela.element(Introduction, {  }, [])])(state_App.page)])])]]);
    };
  }
});

(function(){
  if (typeof window !== 'undefined') {
    window.App = App;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { App };
  }
})();