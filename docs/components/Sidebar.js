
const Sidebar = Tela.defineComponent({
  name: 'Sidebar',
  
  
  setup(instance) {
    const state_Sidebar = Tela.reactive({
      
    }, instance.update, {});

    

    

    

    return () => {
      
      return Tela.element('nav', { 'class': "tela-Sidebar-nav-0", 'style': { 'transform': (instance.props.isOpen ? "translateX(0)" : "") } }, [Tela.element('div', { 'class': "tela-Sidebar-div-1" }, ["Overview"]), Tela.element('button', { 'class': "tela-Sidebar-button-2", 'onclick': (e) => { instance.props.onNav("introduction"); } }, ["Introduction"]), Tela.element('button', { 'class': "tela-Sidebar-button-3", 'onclick': (e) => { instance.props.onNav("getting-started"); } }, ["Getting Started"]), Tela.element('button', { 'class': "tela-Sidebar-button-4", 'onclick': (e) => { instance.props.onNav("component-anatomy"); } }, ["Component Anatomy"]), Tela.element('div', { 'class': "tela-Sidebar-div-5" }, ["Core Concepts"]), Tela.element('button', { 'class': "tela-Sidebar-button-6", 'onclick': (e) => { instance.props.onNav("reactive-state"); } }, ["Reactive State"]), Tela.element('button', { 'class': "tela-Sidebar-button-7", 'onclick': (e) => { instance.props.onNav("props"); } }, ["Props"]), Tela.element('button', { 'class': "tela-Sidebar-button-8", 'onclick': (e) => { instance.props.onNav("template-syntax"); } }, ["Template Syntax"]), Tela.element('div', { 'class': "tela-Sidebar-div-9" }, ["Interactivity"]), Tela.element('button', { 'class': "tela-Sidebar-button-10", 'onclick': (e) => { instance.props.onNav("events"); } }, ["Events"]), Tela.element('button', { 'class': "tela-Sidebar-button-11", 'onclick': (e) => { instance.props.onNav("control-flow"); } }, ["Control Flow"]), Tela.element('button', { 'class': "tela-Sidebar-button-12", 'onclick': (e) => { instance.props.onNav("two-way-binding"); } }, ["Two-way Binding"]), Tela.element('div', { 'class': "tela-Sidebar-div-13" }, ["Advanced"]), Tela.element('button', { 'class': "tela-Sidebar-button-14", 'onclick': (e) => { instance.props.onNav("async-data"); } }, ["Async and Data Fetching"]), Tela.element('button', { 'class': "tela-Sidebar-button-15", 'onclick': (e) => { instance.props.onNav("child-components"); } }, ["Child Components"]), Tela.element('button', { 'class': "tela-Sidebar-button-16", 'onclick': (e) => { instance.props.onNav("lifecycle"); } }, ["Lifecycle Hooks"]), Tela.element('div', { 'class': "tela-Sidebar-div-17" }, ["Integrations"]), Tela.element('button', { 'class': "tela-Sidebar-button-18", 'onclick': (e) => { instance.props.onNav("spring-boot"); } }, ["Spring Boot"])]);
    };
  }
});

(function(){
  if (typeof window !== 'undefined') {
    window.Sidebar = Sidebar;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Sidebar };
  }
})();