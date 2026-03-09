
const App = Tela.defineComponent({
  name: 'App',
  
  
  setup(instance) {
    const state_App = Tela.reactive({
      page: "introduction",
      sidebarOpen: false
    }, instance.update, {});

    

    const nav = (p) => {
      state_App.page = p;
      state_App.sidebarOpen = false;
    };

    const toggleSidebar = () => {
      state_App.sidebarOpen = (!state_App.sidebarOpen);
    };

    

    return () => {
      
      return Tela.element('div', { 'class': "tela-App-div-0" }, [Tela.element('header', { 'class': "tela-App-header-1" }, [Tela.element('div', { 'class': "tela-App-div-2" }, [Tela.element('span', { 'class': "tela-App-span-3" }, ["Tela"]), Tela.element('span', { 'class': "tela-App-span-4" }, ["v0.1 alpha"])]), Tela.element('div', { 'class': "tela-App-div-5" }, [Tela.element('a', { 'class': "tela-App-a-6", 'href': "https://github.com/tela-lang/tela" }, ["GitHub"]), Tela.element('a', { 'class': "tela-App-a-7", 'href': "https://www.npmjs.com/package/@tela-lang/tela" }, ["npm"]), Tela.element('button', { 'class': "tela-App-button-8", 'onclick': (e) => { nav("introduction"); } }, ["Docs"])]), Tela.element('button', { 'class': "tela-App-button-9", 'onclick': toggleSidebar }, [(state_App.sidebarOpen ? "✕" : "☰")])]), ((state_App.page === "hero")) ? [Tela.element(Hero, { 'onStart': nav }, [])] : [Tela.element('div', { 'class': "tela-App-div-10" }, [Tela.element('div', { 'class': "tela-App-div-11", 'style': { 'display': (state_App.sidebarOpen ? "block" : "none") }, 'onclick': toggleSidebar }, []), Tela.element(Sidebar, { 'activePage': state_App.page, 'onNav': nav, 'isOpen': state_App.sidebarOpen }, []), Tela.element('div', { 'class': "tela-App-div-12" }, [((state_App.page === "introduction")) ? [Tela.element(Introduction, {  }, [])] : [((state_App.page === "getting-started")) ? [Tela.element(GettingStarted, {  }, [])] : [((state_App.page === "component-anatomy")) ? [Tela.element(ComponentAnatomy, {  }, [])] : [((state_App.page === "reactive-state")) ? [Tela.element(ReactiveState, {  }, [])] : [((state_App.page === "props")) ? [Tela.element(PropsSection, {  }, [])] : [((state_App.page === "template-syntax")) ? [Tela.element(TemplateSyntax, {  }, [])] : [((state_App.page === "events")) ? [Tela.element(EventsSection, {  }, [])] : [((state_App.page === "control-flow")) ? [Tela.element(ControlFlow, {  }, [])] : [((state_App.page === "two-way-binding")) ? [Tela.element(TwoWayBinding, {  }, [])] : [((state_App.page === "async-data")) ? [Tela.element(AsyncData, {  }, [])] : [((state_App.page === "child-components")) ? [Tela.element(ChildComponents, {  }, [])] : [((state_App.page === "lifecycle")) ? [Tela.element(Lifecycle, {  }, [])] : [Tela.element(SpringBoot, {  }, [])]]]]]]]]]]]]])])]]);
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