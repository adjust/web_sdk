## 摘要

这是 Adjust™ 的网站和网络应用 Javascript SDK 包。您可以在 [adjust.com] 了解更多有关 Adjust™ 的信息。

Read this in other languages: [English][en-readme], [中文][zh-readme], [日本語][ja-readme], [한국어][ko-readme].

## 目录

* [应用示例](#example-app)
* [安装](#installation)
* [初始化](#initialization)   
* [事件跟踪](#event-tracking)
* [统一回传参数](#global-callback-parameters)
* [统一合作伙伴参数](#global-partner-parameters)
* [离线/在线模式](#offline-online-mode)
* [停用/重启 SDK](#stop-restart-sdk)
* [GDPR 被遗忘权](#gdpr-forget-me)
* [选择退出营销活动](#marketing-opt-out)
* [许可协议](#license)

## <a id="example-app">应用示例</a>

您可以查看本存储库中的[应用示例][example-app]，了解如何在网络应用中使用我们的 SDK。

## <a id="installation">安装</a>

本 SDK 可用于跟踪安装、会话和事件。您只需将 Adjust Web SDK 添加至自己的网络应用中即可。

我们的 SDK 暴露在所有模块定义下，所以可在 CommonJS 和 AMD 环境中使用；通过 CDN 加载时，亦在全局 `Adjust` 下可用。

若需通过 CDN 延迟加载 Adjust Web SDK，请将下列代码片段复制到 `<head>` 标签：

```html
<script type="application/javascript">
!function(t,a,e,r,s,n,l,d,o){t.Adjust=t.Adjust||{},t.Adjust_q=t.Adjust_q||[];for(var c=0;c<n.length;c++)l(t.Adjust,t.Adjust_q,n[c]);d=a.createElement("script"),o=a.getElementsByTagName("script")[0],d.async=!0,d.src="https://cdn.adjust.com/adjust-latest.min.js",d.onload=function(){for(var a=0;a<t.Adjust_q.length;a++)t.Adjust[t.Adjust_q[a][0]].apply(t.Adjust,t.Adjust_q[a][1]);t.Adjust_q=[]},o.parentNode.insertBefore(d,o)}(window,document,0,0,0,["initSdk","trackEvent","addGlobalCallbackParameters","addGlobalPartnerParameters","removeGlobalCallbackParameter","removeGlobalPartnerParameter","clearGlobalCallbackParameters","clearGlobalPartnerParameters","switchToOfflineMode","switchBackToOnlineMode","stop","restart","gdprForgetMe","disableThirdPartySharing","initSmartBanner"],function(t,a,e){t[e]=function(){a.push([e,arguments])}});
</script>
```

Adjust Web SDK 在每个页面应当仅加载一次，每次页面加载应当初始化一次。

在通过 CDN 加载 SDK 时，我们建议您使用精简版本。您可以定向特定版本，如 `https://cdn.adjust.com/adjust-5.2.1.min.js`；如果您需要自动更新，不想变更目标文件，也可以定向最新版本：`https://cdn.adjust.com/adjust-latest.min.js` 。SDK 文件均有缓存，因此能以最快速度获取，缓存每半小时刷新一次。如果您想立即获得更新，请务必定向特定版本。

您也可以通过 NPM 安装我们的 SDK：

```
npm install @adjustcom/adjust-web-sdk --save
```

## <a id="initialization">初始化</a>

要初始化 Adjust Web SDK，您必须尽快调用 `Adjust.initSdk`方法：

```js
Adjust.initSdk({
  appToken: 'YOUR_APP_TOKEN',
  environment: 'production'
});
```
 
请在此查阅适用于 `initSdk` 办法的可用参数完整列表：

### 必要参数

<a id="app-token">**appToken**</a> `字符串`

初始化方法需要该参数，所以请务必提供有效的应用识别码

<a id="environment">**environment**</a> `字符串` 

这一项也是必要参数，可选 `production` 或 `sandbox`。如果您是在本地测试网络应用的 SDK，请使用 `sandbox`。

### 可选参数
 
<a id="attribution-callback">**attributionCallback**</a> `函数`

该参数可接受函数，且为针对归因变更的回传函数。回传包括两个参数：一个是内部事件名称 (可忽略)，另一个是包含已变更归因有关信息的对象。

示例：
```js
Adjust.initSdk({
  // ... 其他参数 (包括必要参数) 均置于此处
  attributionCallback: function (e, attribution) {
    // e：内部事件名称，可忽略
    // attribution: 发生变更的归因详情
  }
});
```

<a id="default-tracker">**defaultTracker**</a> `字符串`

默认情况下，无法归因至任何推广活动的用户会被归因为自然用户，归于应用的自然跟踪链接下。如果您想改写这一行为，将此类流量归因于另一个跟踪链接，可以采用该方法设置新的默认跟踪链接。

<a id="custom-url">**customUrl**</a> `字符串`

默认状态下，所以的请求都会发送至 Adjust 的终端。您可以将所有请求重定向至自定义的终端。 

<a id="event-deduplication-list-limit">**eventDeduplicationListLimit**</a> `数值`

该参数值默认为 `10`。您可以改写该限值，但请务必选择正数，且数值不要太大。这将缓存最近 `n` 个 (由该参数定义的) 去重 ID，用来排重带有相同 ID 的重复事件。

<a id="log-level">**logLevel**</a> `字符串`

该参数默认为 `error`。可能的参数值有 `none`、`error`、`info`、`verbose`。在进行测试时，我们强烈建议您使用 `verbose`，以便查看精准的日志，确保集成能正确完成。
每种日志级别的详情如下：
- `verbose` - 在有特定操作时会输出详细信息
- `info` - 只会输出基本信息
- `error` - 只会输出错误消息
- `none` - 完全不进行输出

<a id="log-output">**logOutput**</a> `字符串`

您可以定义 html 容器，在那里查看自己的日志。如果您要在移动设备上进行测试，或希望直接在屏幕上查看日志 (只推荐在测试中这样做)，则可使用该功能。


## <a id="event-tracking">事件跟踪</a>

您可以借助 Adjust 跟踪事件。例如，您想跟踪特定按钮的所有点击。要达到这个目的，您需要在自己的 [控制面板][dashboard] 中创建新的事件识别码。这个新识别码拥有关联的事件识别码，例如类似于`abc123`。要在您的网络应用中跟踪该事件，请进行下列操作：

```js
Adjust.trackEvent({
  eventToken: 'YOUR_EVENT_TOKEN'
})
```

请务必先[初始化](#initialization) Adjust SDK，再进行事件跟踪。
请在此查阅适用于 `trackEvent` 办法的可用参数完整列表：

### 必要参数

<a id="event-token">**eventToken**</a> `字符串`

跟踪事件方法需要该参数，所以请务必提供有效的事件识别码

### 可选参数

<a id="revenue">**revenue**</a> `数值`

如果您想将收入金额附加到某一事件中 (例如，您希望跟踪发生在网络应用中的某类购买)，就要为该参数提供正数值。您还必须提供 [`currency`](#currency) 参数，详细描述请参见下一节

<a id="currency">**currency**</a> `字符串`

如果您想跟踪收入事件，就需要提供此参数。请使用有效的货币代码，如`EUR`、`USD` 等。

示例：

```js
Adjust.trackEvent({
  // ... 其他参数 (包括必要参数) 均置于此处
  revenue: 110,
  currency: 'EUR'
})
```

设置货币识别码后，Adjust 会自动将收入转化为您所选的报告币种。请 [在此][currency-conversion] 了解更多货币换算相关信息。

进一步了解收入和事件跟踪相关信息，欢迎参阅[事件跟踪指南](https://zh.help.adjust.com/tracking/revenue-events)。

<a id="callback-params">**callbackParams**</a> `数组`

您可以在 [控制面板] 中为事件设置回传 URL。这样，只要跟踪到事件，我们就会向该 URL 发送 GET 请求。您可以将 `callbackParams` 参数附加至传递到 `trackEvent` 方法的映射对象中，从而向该事件附加回传参数。然后我们会将这些参数附加至您的回传 URL。

例如，假设您输入了 URL `https://www.mydomain.com/callback`则使用以下方式跟踪事件：

```js
Adjust.trackEvent({
  // ... 其他参数 (包括必要参数) 均置于此处
  callbackParams: [
    {key: 'key', value: 'value'}, 
    {key: 'foo', value: 'bar'}
  ]
})
```

在这种情况下，我们会跟踪该事件并发送请求至：

    https://www.mydomain.com/callback?key=value&foo=bar

请注意，我们不会存储您的任何自定义参数，而是仅将这些参数附加到您的回传中。所以如果没有设置回传，这些参数不会被保存，也不会被发送给您。

若想进一步了解 URL 回传，查看可用参数的完整列表，请参阅我们的 [回传指南][callbacks-guide]。

<a id="partner-params">**partnerParams**</a> `数组`

在 Adjust 控制面板中启用了相关功能后，您还可以添加与合作伙伴共享的参数。
这里的原理与上文提到的回传参数原理类似，但要将 `partnerParams` 参数添加到传递给 `trackEvent` 方法的映射对象中，实现合作伙伴参数的附加：

```js
Adjust.trackEvent({
  // ... 其他参数 (包括必要参数) 均置于此处
  partnerParams: [
    {key: 'key', value: 'value'}, 
    {key: 'foo', value: 'bar'}
  ]
})
```

您可以在我们的 [特殊合作伙伴指南][special-partners] 中了解更多有关特殊合作伙伴以及这些集成的信息。

<a id="deduplication-id">**deduplicationId**</a> `字符串`

您可以提供事件排重 ID，避免跟踪重复的事件。初始化配置中设置了排重列表上限，请参阅 [上文](#event-deduplication-list-limit)

## <a id="global-callback-parameters">统一回传参数</a>

统一回传参数有多种可用的方法，如添加、移除和清理。我们在下方列出了每种可用的方法：

<a id="add-global-callback-parameters">**addGlobalCallbackParameters**</a>

您可以添加统一回传参数。统一回传参数会被自动附加到每个会话和事件请求中。请注意，直接传递给 `trackEvent` 方法的回传参数会覆盖现有的统一回传参数。该方法接受的数组格式与 `trackEvent` 方法的 [`callbackParams`](#callback-params) 参数相同

示例：

```js
Adjust.addGlobalCallbackParameters([
  {key: 'key1', value: 'value1'},
  {key: 'key2', value: 'value2'}
]);
```

<a id="remove-global-callback-parameter">**removeGlobalCallbackParameter**</a>

要使用该方法移除特定的回传参数，请提供需要被移除的统一回传参数键。

示例：

```js
Adjust.removeGlobalCallbackParameter('key1');
```

<a id="clear-global-callback-parameters">**clearGlobalCallbackParameters**</a>

调用该方法可清理所有统一回传参数。

示例：

```js
Adjust.clearGlobalCallbackParameters();
```

## <a id="global-partner-parameters">统一合作伙伴参数</a>

您可以使用与 [统一回传参数](#global-callback-parameters) 类似的方式，添加、移除或清理统一合作伙伴参数。我们在下方列出了每种可用的方法：


<a id="add-global-parnter-parameters">**addGlobalPartnerParameters**</a>

您可以添加统一合作伙伴参数。统一合作伙伴参数会被自动附加到每个会话和事件请求中。请注意，直接传递给 `trackEvent` 方法的合作伙伴参数会覆盖现有的统一合作伙伴参数。该方法接受的数组格式与 `trackEvent` 方法的 [`partnerParams`](#partner-params) 参数相同

示例：

```js
Adjust.addGlobalPartnerParameters([
  {key: 'key1', value: 'value1'},
  {key: 'key2', value: 'value2'}
]);
```

<a id="remove-global-partner-parameter">**removeGlobalPartnerParameter**</a>

要使用该方法移除特定的合作伙伴参数，请提供需要被移除的统一合作伙伴参数键。

示例：

```js
Adjust.removeGlobalPartnerParameter('key1');
```

<a id="clear-global-partner-parameters">**clearGlobalPartnerParameters**</a>

调用该方法可清理所有统一合作伙伴参数。

示例：

```js
Adjust.clearGlobalPartnerParameters();
```

## <a id="offline-online-mode">离线/在线模式</a>

默认情况下，Adjust SDK 启动时始终处于在线模式。但如果您想暂停所有渠道请求，如事件和会话跟踪等，可以将 Adjust SDK 设置为离线模式 (但即便在离线模式下，初次会话也会被发送)。
要启用或停用离线模式，有两种可用方法：

<a id="switch-to-offline-mode">**switchToOfflineMode**</a>

该方法会将 Adjust SDK 设置为离线模式

示例：

```js
Adjust.switchToOfflineMode();
```

<a id="switch-back-to-online-mode">**switchBackToOnlineMode**</a>

该方法会将 Adjust SDK 重新设置为在线模式

```js
Adjust.switchBackToOnlineMode();
```

## <a id="stop-restart-sdk">停用/重启 SDK</a>

在特定情况下，您可以完全停止 SDK 的运行。 
这也就意味着 SDK 将停止跟踪会话和事件，总体上完全中止运行。
但一段时间后，您可以重启 SDK。要实现该功能，可用的方法如下：

<a id="stop">**stop**</a>

这将停止 Adjust SDK 的运行

示例：

```js
Adjust.stop();
``` 

<a id="restart">**restart**</a>

这将重新启动 Adjust SDK

示例：

```js
Adjust.restart();
``` 


## <a id="gdpr-forget-me">GDPR 被遗忘权</a>

若要行使特定用户的 GDPR 被遗忘权，可以使用该功能。我们的后端会收到通知，中止 Adjust SDK 的运行。 
可用的方法有一种：

<a id="gdpr-forget-me">**gdprForgetMe**</a>

使用该方法，可停止 Adjust SDK 的运行，并通知 Adjust 后端，用户希望行使自己的 GDPR 被遗忘权。
以此方法停用 Adjust SDK 后，就无法再度启用。

示例：

```js
Adjust.gdprForgetMe();
```

更多详情，请参阅[这里](https://help.adjust.com/manage-data/data-privacy/gdpr)

## <a id="marketing-opt-out">选择退出营销活动</a>

使用该功能可禁用第三方共享功能，选择退出营销。我们的后端会收到通知，通知方式与 "GDPR 被遗忘权" 相同。

可用的方法有一种：

<a id="disable-third-party-sharing">**disableThirdPartySharing**</a>

示例：

```js
Adjust.disableThirdPartySharing();
```

## <a id="license">许可协议</a>

Adjust SDK 已获得 MIT 许可。

版权所有 (c) 2020 Adjust GmbH，https://www.adjust.com

特此授权，持有本软件及相关文档文件（下称“本软件”）的任何人
均可无限制地处理本软件，
其范围包括但不限于使用、复制、修改、合并、发布、分发、再许可
和/或销售本软件的副本；
具备本软件上述权限之人员
需同意以下条件：

上述版权声明和本许可声明应包含在
本软件的所有副本或主要部分中。

本软件按“原样”提供，
不提供任何形式的明示或暗示保证，
包括但不限于有关适销性、适用于特定用途以及非侵权性的保证。在任何情况下，
作者或版权所有者都不应承担由本软件及本软件的使用或其他相关活动引起的或与之相关的
合同行为和侵权行为中的
任何索赔、损害赔偿
或其他责任。



[adjust.com]:   https://adjust.com
[dashboard]:   https://adjust.com
[example-app]:  src/demo.html

[callbacks-guide]:    https://zh.help.adjust.com/manage-data/raw-data-exports/callbacks
[special-partners]:   https://zh.help.adjust.com/dashboard/integrated-partners
[currency-conversion]: https://zh.help.adjust.com/tracking/revenue-events/currency-conversion

[en-readme]:  ../../README.md
[zh-readme]:  ../chinese/README.md
[ja-readme]:  ../japanese/README.md
[ko-readme]:  ../korean/README.md
