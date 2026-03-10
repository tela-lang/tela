
const Lifecycle = Tela.defineComponent({
  name: 'Lifecycle',
  
  
  setup(instance) {
    const state_Lifecycle = Tela.reactive({
      lifecycleCode: ""
    }, instance.update, {});

    

    

    

    

    

    // onMount
    state_Lifecycle.lifecycleCode = window.TELA_DOCS.lifecycleCode;

    return () => {
      
      return Tela.element('div', {  }, [Tela.element('h1', { 'class': "tela-Lifecycle-h1-0" }, ["Lifecycle Hooks"]), Tela.element('div', { 'class': "tela-Lifecycle-div-1" }, [""]), Tela.element('p', { 'class': "tela-Lifecycle-p-2" }, ["Tela provides three lifecycle hooks that let you run code at specific points during a component's life in the DOM."]), Tela.element('h2', { 'class': "tela-Lifecycle-h2-3" }, ["Example"]), Tela.element('div', { 'class': "tela-Lifecycle-div-4" }, [Tela.element('pre', { 'class': "tela-Lifecycle-pre-5" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_Lifecycle.lifecycleCode}`])])]), Tela.element('h2', { 'class': "tela-Lifecycle-h2-6" }, ["Hook Reference"]), Tela.element('div', { 'class': "tela-Lifecycle-div-7" }, [Tela.element('div', { 'class': "tela-Lifecycle-div-8" }, [Tela.element('div', { 'class': "tela-Lifecycle-div-9" }, ["onMount"]), Tela.element('div', { 'class': "tela-Lifecycle-div-10" }, ["Runs once after the component is first inserted into the DOM. Use it to load data, set up subscriptions, or read DOM measurements."])]), Tela.element('div', { 'class': "tela-Lifecycle-div-11" }, [Tela.element('div', { 'class': "tela-Lifecycle-div-12" }, ["onUpdate"]), Tela.element('div', { 'class': "tela-Lifecycle-div-13" }, ["Runs after every re-render triggered by a state change. Useful for syncing third-party widgets or measuring updated layout."])]), Tela.element('div', { 'class': "tela-Lifecycle-div-14" }, [Tela.element('div', { 'class': "tela-Lifecycle-div-15" }, ["onDestroy"]), Tela.element('div', { 'class': "tela-Lifecycle-div-16" }, ["Runs when the component is removed from the DOM. Use it to clear timers, remove event listeners, or cancel pending requests."])])])]);
    };
  }
});

(function(){
  if (typeof window !== 'undefined') {
    window.Lifecycle = Lifecycle;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Lifecycle };
  }
})();