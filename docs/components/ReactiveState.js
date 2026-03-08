
const ReactiveState = Tela.defineComponent({
  name: 'ReactiveState',
  
  
  setup(instance) {
    const state_ReactiveState = Tela.reactive({
      stateCode: ""
    }, instance.update, {});

    

    

    // onMount
    state_ReactiveState.stateCode = window.TELA_DOCS.stateCode;

    return () => {
      
      return Tela.element('div', {  }, [Tela.element('h1', { 'class': "tela-ReactiveState-h1-0" }, ["Reactive State"]), Tela.element('div', { 'class': "tela-ReactiveState-div-1" }, [""]), Tela.element('p', { 'class': "tela-ReactiveState-p-2" }, ["State is the heart of every Tela component. Declare it with the state keyword and Tela tracks every read and write automatically."]), Tela.element('p', { 'class': "tela-ReactiveState-p-3" }, ["When you assign a new value to a state variable, Tela re-renders only the DOM nodes that depend on it. No virtual DOM diffing, no manual invalidation."]), Tela.element('h2', { 'class': "tela-ReactiveState-h2-4" }, ["Example: Timer"]), Tela.element('div', { 'class': "tela-ReactiveState-div-5" }, [Tela.element('pre', { 'class': "tela-ReactiveState-pre-6" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_ReactiveState.stateCode}`])])]), Tela.element('h2', { 'class': "tela-ReactiveState-h2-7" }, ["Supported State Types"]), Tela.element('p', { 'class': "tela-ReactiveState-p-8" }, ["Tela supports four state types: String for text values, Number for numeric values, Boolean for true/false flags, and Array for lists of items. The type annotation is used by the compiler to generate efficient update code."]), Tela.element('div', { 'class': "tela-ReactiveState-div-9" }, [Tela.element('p', { 'class': "tela-ReactiveState-p-10" }, ["State is always local. Two instances of the same component have completely independent state — no shared mutable globals."])])]);
    };
  }
});

(function(){
  if (typeof window !== 'undefined') {
    window.ReactiveState = ReactiveState;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ReactiveState };
  }
})();