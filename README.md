# BOT姬

```mermaid
graph LR

a[事件驱动] --> b[API]
a --> c[事件列表]
c --> d[事件]


```

```typescript
import { Api } from "../api";
import { event as e } from "../struct";

export async function onLoad() {
	console.log("plugin", "加载成功");
}
export async function onEvent(msg: e.Msg, api: Api) {}
```