
const PropsSection = Tela.defineComponent({
  name: 'PropsSection',
  
  
  setup(instance) {
    const state_PropsSection = Tela.reactive({
      propsCode: "",
      propsUsageCode: "",
      propsDefaultCode: ""
    }, instance.update, {});

    

    

    const navigate = (dest) => {
      window.history.pushState(null, '', dest);
      window.dispatchEvent(new PopStateEvent('popstate'));
    };

    

    

    

    // onMount
    state_PropsSection.propsCode = window.TELA_DOCS.propsCode;
      state_PropsSection.propsUsageCode = window.TELA_DOCS.propsUsageCode;
      state_PropsSection.propsDefaultCode = window.TELA_DOCS.propsDefaultCode;

    return () => {
      
      return Tela.element('div', {  }, [Tela.element('h1', { 'class': "tela-PropsSection-h1-0" }, ["Props"]), Tela.element('div', { 'class': "tela-PropsSection-div-1" }, [""]), Tela.element('p', { 'class': "tela-PropsSection-p-2" }, ["Props let parent components pass data down to children. Declare them with the prop keyword. They behave like read-only state inside the component."]), Tela.element('h2', { 'class': "tela-PropsSection-h2-3" }, ["Declaring Props"]), Tela.element('p', { 'class': "tela-PropsSection-p-4" }, ["A Badge component with label and color props:"]), Tela.element('div', { 'class': "tela-PropsSection-div-5" }, [Tela.element('pre', { 'class': "tela-PropsSection-pre-6" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_PropsSection.propsCode}`])])]), Tela.element('h2', { 'class': "tela-PropsSection-h2-7" }, ["Passing Props"]), Tela.element('p', { 'class': "tela-PropsSection-p-8" }, ["Pass props using key: value pairs inside the component tag:"]), Tela.element('div', { 'class': "tela-PropsSection-div-9" }, [Tela.element('pre', { 'class': "tela-PropsSection-pre-10" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_PropsSection.propsUsageCode}`])])]), Tela.element('h2', { 'class': "tela-PropsSection-h2-11" }, ["Default Values"]), Tela.element('p', { 'class': "tela-PropsSection-p-12" }, ["Assign a default after the type with = and the caller can omit that prop. The compiler emits a nullish coalescing expression so the default only applies when the parent passes null or undefined."]), Tela.element('div', { 'class': "tela-PropsSection-div-13" }, [Tela.element('pre', { 'class': "tela-PropsSection-pre-14" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_PropsSection.propsDefaultCode}`])])]), Tela.element('div', { 'class': "tela-PropsSection-div-15" }, [Tela.element('div', { 'class': "tela-PropsSection-div-16" }, ["Compiled output"]), Tela.element('div', { 'class': "tela-PropsSection-div-17" }, ["prop color: String = \"#34786e\" compiles to (instance.props.color ?? \"#34786e\") at every point of access, including inside template literals."])]), Tela.element('h2', { 'class': "tela-PropsSection-h2-18" }, ["Callback Props"]), Tela.element('p', { 'class': "tela-PropsSection-p-19" }, ["Use prop type Function to pass callbacks from parent to child. This is how child components communicate upward: the parent passes a function reference and the child calls it on events."])]);
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