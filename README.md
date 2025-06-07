Rete.js Stimulus plugin
====
[![Made in Ukraine](https://img.shields.io/badge/made_in-ukraine-ffd700.svg?labelColor=0057b7)](https://stand-with-ukraine.pp.ua)
[![Discord](https://img.shields.io/discord/1081223198055604244?color=%237289da&label=Discord)](https://discord.gg/cxSFkPZdsV)

**Rete.js plugin**

## Key features

- **Render elements**: visualize nodes and connections using Stimulus controllers
- **Customization**: modify appearance and behavior for a personalized workflow
- **Presets**: predefined Stimulus controllers for different types of features
  -  **[Classic](https://retejs.org/docs/guides/renderers/stimulus#connect-plugin)**: provides a classic visualization of nodes, connections, and controls
  -  **[Context menu](https://retejs.org/docs/guides/context-menu#render-context-menu)**: provides a classic appearance for `rete-context-menu-plugin`
  -  **[Minimap](https://retejs.org/docs/guides/minimap#render)**: provides a classic appearance for `rete-minimap-plugin`
  -  **[Reroute](https://retejs.org/docs/guides/reroute#rendering)**: provides a classic appearance for `rete-connection-reroute-plugin`

## Getting Started

Please refer to the [guide](https://retejs.org/docs/guides/renderers/stimulus) and [example](https://retejs.org/examples/stimulus) using this plugin

## Using with Rails

Rails applications can leverage Stimulus controllers to render Rete.js elements.
Install the plugin along with its peer dependencies:

```bash
yarn add rete rete-area-plugin rete-stimulus-plugin @hotwired/stimulus
```

Create a Stimulus controller for a node view:

```javascript
// app/javascript/controllers/node_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { label: String }

  connect() {
    this.element.textContent = this.labelValue
  }

  update(props) {
    if (props.label) this.element.textContent = props.label
  }
}
```

Initialize the editor and plugin inside your JavaScript pack:

```javascript
// app/javascript/packs/editor.js
import { Application } from "@hotwired/stimulus"
import { NodeEditor } from "rete"
import { AreaPlugin } from "rete-area-plugin"
import { StimulusPlugin } from "rete-stimulus-plugin"
import NodeController from "../controllers/node_controller"

const application = Application.start()

const container = document.getElementById("editor")
const editor = new NodeEditor()
const area = new AreaPlugin(editor, container)

area.use(new StimulusPlugin({ application }))

// example of adding a node using the Stimulus controller
const node = await editor.createNode("example")
area.addNode(node, { controller: NodeController, props: { label: "Hello" } })
```

Finally include the container and pack in a Rails view:

```erb
<div id="editor"></div>
<%= javascript_pack_tag "editor" %>
```

## Contribution

Please refer to the [Contribution](https://retejs.org/docs/contribution) guide

## License

[MIT](https://github.com/retejs/stimulus-plugin/blob/main/LICENSE)
