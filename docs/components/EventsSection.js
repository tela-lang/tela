
const EventsSection = Tela.defineComponent({
  name: 'EventsSection',
  
  
  setup(instance) {
    const state_EventsSection = Tela.reactive({
      eventsCode: "",
      eventsArgCode: ""
    }, instance.update, {});

    

    

    // onMount
    state_EventsSection.eventsCode = window.TELA_DOCS.eventsCode;
      state_EventsSection.eventsArgCode = window.TELA_DOCS.eventsArgCode;

    return () => {
      
      return Tela.element('div', {  }, [Tela.element('h1', { 'class': "tela-EventsSection-h1-0" }, ["Events"]), Tela.element('div', { 'class': "tela-EventsSection-div-1" }, [""]), Tela.element('p', { 'class': "tela-EventsSection-p-2" }, ["Attach event handlers using the @ prefix on any element attribute. Tela supports all standard DOM events: click, input, submit, change, keydown, and more."]), Tela.element('h2', { 'class': "tela-EventsSection-h2-3" }, ["Basic Event Handling"]), Tela.element('p', { 'class': "tela-EventsSection-p-4" }, ["Reference a function by name or call it with arguments:"]), Tela.element('div', { 'class': "tela-EventsSection-div-5" }, [Tela.element('pre', { 'class': "tela-EventsSection-pre-6" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_EventsSection.eventsCode}`])])]), Tela.element('h2', { 'class': "tela-EventsSection-h2-7" }, ["Passing Arguments"]), Tela.element('p', { 'class': "tela-EventsSection-p-8" }, ["Call handlers with arguments inside for loops to pass the current item's data:"]), Tela.element('div', { 'class': "tela-EventsSection-div-9" }, [Tela.element('pre', { 'class': "tela-EventsSection-pre-10" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_EventsSection.eventsArgCode}`])])]), Tela.element('div', { 'class': "tela-EventsSection-div-11" }, [Tela.element('p', { 'class': "tela-EventsSection-p-12" }, ["Event handlers on component tags (uppercase names) become prop-based callbacks rather than DOM event listeners."])])]);
    };
  }
});

(function(){
  if (typeof window !== 'undefined') {
    window.EventsSection = EventsSection;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EventsSection };
  }
})();