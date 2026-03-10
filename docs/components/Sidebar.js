
const Sidebar = Tela.defineComponent({
  name: 'Sidebar',
  
  
  setup(instance) {
    const state_Sidebar = Tela.reactive({
      
    }, instance.update, {});

    

    

    const navigate = (dest) => {
      window.history.pushState(null, '', dest);
      window.dispatchEvent(new PopStateEvent('popstate'));
    };

    

    

    

    

    return () => {
      
      return Tela.element('nav', { 'class': "tela-Sidebar-nav-0", 'style': { 'transform': (instance.props.isOpen ? "translateX(0)" : "") } }, [Tela.element('div', { 'class': "tela-Sidebar-div-1" }, ["Overview"]), Tela.element('button', { 'class': "tela-Sidebar-button-2", 'onclick': (e) => { instance.props.onNav("introduction"); } }, ["Introduction"]), Tela.element('button', { 'class': "tela-Sidebar-button-3", 'onclick': (e) => { instance.props.onNav("getting-started"); } }, ["Getting Started"]), Tela.element('button', { 'class': "tela-Sidebar-button-4", 'onclick': (e) => { instance.props.onNav("component-anatomy"); } }, ["Component Anatomy"]), Tela.element('div', { 'class': "tela-Sidebar-div-5" }, ["Core Concepts"]), Tela.element('button', { 'class': "tela-Sidebar-button-6", 'onclick': (e) => { instance.props.onNav("reactive-state"); } }, ["Reactive State"]), Tela.element('button', { 'class': "tela-Sidebar-button-7", 'onclick': (e) => { instance.props.onNav("props"); } }, ["Props"]), Tela.element('button', { 'class': "tela-Sidebar-button-8", 'onclick': (e) => { instance.props.onNav("template-syntax"); } }, ["Template Syntax"]), Tela.element('button', { 'class': "tela-Sidebar-button-9", 'onclick': (e) => { instance.props.onNav("enums-models"); } }, ["Enums and Models"]), Tela.element('div', { 'class': "tela-Sidebar-div-10" }, ["Interactivity"]), Tela.element('button', { 'class': "tela-Sidebar-button-11", 'onclick': (e) => { instance.props.onNav("events"); } }, ["Events"]), Tela.element('button', { 'class': "tela-Sidebar-button-12", 'onclick': (e) => { instance.props.onNav("control-flow"); } }, ["Control Flow"]), Tela.element('button', { 'class': "tela-Sidebar-button-13", 'onclick': (e) => { instance.props.onNav("switch-case"); } }, ["Switch / Case"]), Tela.element('button', { 'class': "tela-Sidebar-button-14", 'onclick': (e) => { instance.props.onNav("loops"); } }, ["Loops"]), Tela.element('button', { 'class': "tela-Sidebar-button-15", 'onclick': (e) => { instance.props.onNav("two-way-binding"); } }, ["Two-way Binding"]), Tela.element('div', { 'class': "tela-Sidebar-div-16" }, ["Advanced"]), Tela.element('button', { 'class': "tela-Sidebar-button-17", 'onclick': (e) => { instance.props.onNav("error-handling"); } }, ["Error Handling"]), Tela.element('button', { 'class': "tela-Sidebar-button-18", 'onclick': (e) => { instance.props.onNav("async-data"); } }, ["Async and Data Fetching"]), Tela.element('button', { 'class': "tela-Sidebar-button-19", 'onclick': (e) => { instance.props.onNav("null-safety"); } }, ["Null Safety"]), Tela.element('button', { 'class': "tela-Sidebar-button-20", 'onclick': (e) => { instance.props.onNav("routing"); } }, ["Routing"]), Tela.element('button', { 'class': "tela-Sidebar-button-21", 'onclick': (e) => { instance.props.onNav("global-store"); } }, ["Global Store"]), Tela.element('button', { 'class': "tela-Sidebar-button-22", 'onclick': (e) => { instance.props.onNav("child-components"); } }, ["Child Components"]), Tela.element('button', { 'class': "tela-Sidebar-button-23", 'onclick': (e) => { instance.props.onNav("lifecycle"); } }, ["Lifecycle Hooks"]), Tela.element('div', { 'class': "tela-Sidebar-div-24" }, ["Integrations"]), Tela.element('button', { 'class': "tela-Sidebar-button-25", 'onclick': (e) => { instance.props.onNav("spring-boot"); } }, ["Spring Boot"]), Tela.element('button', { 'class': "tela-Sidebar-button-26", 'onclick': (e) => { instance.props.onNav("dev-server"); } }, ["Dev Server"]), Tela.element('div', { 'class': "tela-Sidebar-div-27" }, ["Reference"]), Tela.element('button', { 'class': "tela-Sidebar-button-28", 'onclick': (e) => { instance.props.onNav("language-spec"); } }, ["Language Specification"])]);
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