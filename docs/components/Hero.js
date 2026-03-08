
const Hero = Tela.defineComponent({
  name: 'Hero',
  
  
  setup(instance) {
    const state_Hero = Tela.reactive({
      
    }, instance.update, {});

    

    

    

    return () => {
      
      return Tela.element('div', { 'class': "tela-Hero-div-0" }, [Tela.element('div', { 'class': "tela-Hero-div-1" }, ["Tela"]), Tela.element('h1', { 'class': "tela-Hero-h1-2" }, ["Tela"]), Tela.element('p', { 'class': "tela-Hero-p-3" }, ["A declarative UI language for reactive web interfaces. Write once, compile to pure JS and CSS."]), Tela.element('div', { 'class': "tela-Hero-div-4" }, [Tela.element('button', { 'class': "tela-Hero-button-5", 'onclick': (e) => { instance.props.onStart("introduction"); } }, ["Get Started"]), Tela.element('button', { 'class': "tela-Hero-button-6", 'onclick': (e) => { instance.props.onStart("getting-started"); } }, ["Installation"])]), Tela.element('a', { 'class': "tela-Hero-a-7", 'href': "https://www.npmjs.com/package/@tela-lang/tela" }, ["npm: @tela-lang/tela"])]);
    };
  }
});

(function(){
  if (typeof window !== 'undefined') {
    window.Hero = Hero;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Hero };
  }
})();