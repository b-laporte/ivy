import { htmlRenderer } from "../../htmlrenderer";
import { $component, $initProps, $refresh } from "../../iv";

interface IVComponentProps {
  $host: IVWebComponent; //hacky
  name: string;
  foo: number;
  bar: number;
}

class IVComponent {
  props: IVComponentProps;

  init() {
    $initProps(this, <IVComponentProps>{
      name: 'Web Component',
      foo: 1,
      bar: 2,
    });
    this.props.$host.registerIVComponent(this);
  }

  render() {
    `---
    <div> Hello {{this.props.name}}!</div>
    <slot></slot>
    <div> Foo counter: {{this.props.foo}}</div>
    <div> Bar counter: {{this.props.bar}}</div>
    ---`
  }
}

class IVWebComponent extends HTMLElement {
  private renderer;
  private ivComponent: IVComponent;
  // One setter/getter for each props of the IV component
  set name(value: string) { this.setPropsAndRefresh('name', value);}
  set foo(value: number) { this.setPropsAndRefresh('foo', value);}
  set bar(value: number) { this.setPropsAndRefresh('bar', value);}
  get name(): string {return this.ivComponent.props !.name;}
  get foo(): number {return this.ivComponent.props !.foo;}
  get bar(): number {return this.ivComponent.props !.bar;}

  static get observedAttributes() {return ['name', 'foo', 'bar']; }

  constructor() {
    super();
    const shadowRoot = this.attachShadow({mode: 'open'});
    this.renderer = htmlRenderer(shadowRoot, this.render.bind(this));
    this.renderer.refresh();
  }

  connectedCallback() {
    // No use here
  }

  disconnectedCallback() {
    //this.renderer.destroy();
    //this.ivComponent.destroy();
  }

  attributeChangedCallback(attributeName, oldValue, newValue, namespace) {
    if (IVWebComponent.observedAttributes.indexOf(attributeName) > -1) {
      this[attributeName] = newValue;
    }
  }

  adoptedCallback(oldDocument, newDocument) {
    // No use here
  }

  registerIVComponent(ivComponent: IVComponent) {
    this.ivComponent = ivComponent;
  }

  private render() {
    `---
    % const ivCpt = $component(IVComponent);
    <c:ivCpt [$host]=this></c:ivCpt>
    ---`
  }

  private setPropsAndRefresh(propsName: string, propsValue: any) {
    if (this.ivComponent) {
      this.ivComponent.props ![propsName] = propsValue;
      $refresh(this.ivComponent);
    }
  }
}
window.customElements.define('iv-web-component', IVWebComponent);
