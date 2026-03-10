
const TwoWayBinding = Tela.defineComponent({
  name: 'TwoWayBinding',
  
  
  setup(instance) {
    const state_TwoWayBinding = Tela.reactive({
      bindCode: ""
    }, instance.update, {});

    

    

    

    

    

    // onMount
    state_TwoWayBinding.bindCode = window.TELA_DOCS.bindCode;

    return () => {
      
      return Tela.element('div', {  }, [Tela.element('h1', { 'class': "tela-TwoWayBinding-h1-0" }, ["Two-way Binding"]), Tela.element('div', { 'class': "tela-TwoWayBinding-div-1" }, [""]), Tela.element('p', { 'class': "tela-TwoWayBinding-p-2" }, ["Two-way binding connects an input element to a state variable. When the user types, the state updates. When state changes programmatically, the input reflects the new value."]), Tela.element('h2', { 'class': "tela-TwoWayBinding-h2-3" }, ["The bind Directive"]), Tela.element('p', { 'class': "tela-TwoWayBinding-p-4" }, ["Use bind value: stateName on any input, textarea, or select element:"]), Tela.element('div', { 'class': "tela-TwoWayBinding-div-5" }, [Tela.element('pre', { 'class': "tela-TwoWayBinding-pre-6" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_TwoWayBinding.bindCode}`])])]), Tela.element('h2', { 'class': "tela-TwoWayBinding-h2-7" }, ["How It Works"]), Tela.element('p', { 'class': "tela-TwoWayBinding-p-8" }, ["The compiler expands bind value: query into two things: an input event listener that sets query = event.target.value, and a value attribute that reads query. This is pure syntactic sugar — no magic wiring at runtime."]), Tela.element('div', { 'class': "tela-TwoWayBinding-div-9" }, [Tela.element('p', { 'class': "tela-TwoWayBinding-p-10" }, ["You can combine bind with @input or @change handlers. The handler fires after the state has already been updated from the bind directive."])])]);
    };
  }
});

(function(){
  if (typeof window !== 'undefined') {
    window.TwoWayBinding = TwoWayBinding;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TwoWayBinding };
  }
})();