
const PropsSection = Tela.defineComponent({
  name: 'PropsSection',
  
  
  setup(instance) {
    const state_PropsSection = Tela.reactive({
      propsCode: "",
      propsUsageCode: ""
    }, instance.update, {});

    

    

    // onMount
    state_PropsSection.propsCode = window.TELA_DOCS.propsCode;
      state_PropsSection.propsUsageCode = window.TELA_DOCS.propsUsageCode;

    return () => {
      
      return Tela.element('div', {  }, [Tela.element('h1', { 'class': "tela-PropsSection-h1-0" }, ["Props"]), Tela.element('div', { 'class': "tela-PropsSection-div-1" }, [""]), Tela.element('p', { 'class': "tela-PropsSection-p-2" }, ["Props let parent components pass data down to children. Declare them with the prop keyword. They behave like read-only state inside the component."]), Tela.element('h2', { 'class': "tela-PropsSection-h2-3" }, ["Declaring Props"]), Tela.element('p', { 'class': "tela-PropsSection-p-4" }, ["A Badge component with label and color props:"]), Tela.element('div', { 'class': "tela-PropsSection-div-5" }, [Tela.element('pre', { 'class': "tela-PropsSection-pre-6" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_PropsSection.propsCode}`])])]), Tela.element('h2', { 'class': "tela-PropsSection-h2-7" }, ["Passing Props"]), Tela.element('p', { 'class': "tela-PropsSection-p-8" }, ["Pass props using key: value pairs inside the component tag:"]), Tela.element('div', { 'class': "tela-PropsSection-div-9" }, [Tela.element('pre', { 'class': "tela-PropsSection-pre-10" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_PropsSection.propsUsageCode}`])])]), Tela.element('h2', { 'class': "tela-PropsSection-h2-11" }, ["Callback Props"]), Tela.element('p', { 'class': "tela-PropsSection-p-12" }, ["Use prop type Function to pass callbacks from parent to child. This is how child components communicate upward: the parent passes a function reference and the child calls it on events."])]);
    };
  }
});

(function(){
  if (typeof window !== 'undefined') {
    window.PropsSection = PropsSection;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PropsSection };
  }
})();