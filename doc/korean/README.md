## 요약

웹 앱을 위한 Adjust™ Javascript SDK용 가이드입니다. [adjust.com] 에서 Adjust™에 대한 정보를 더 자세히 알아보세요.

## 목차

* [예시 앱](#example-app)
* [기본 연동](#basic-integration) 
  * [권장 사항](#recommendations)
  * [기본 설정](#basic-setup)
* [부가 기능](#additional-features) 
  * [이벤트 트래킹](#event-tracking) 
    * [매출 트래킹](#revenue-tracking)
    * [콜백 파라미터](#callback-parameters)
    * [파트너 파라미터](#partner-parameters)
* [라이센스](#license)

## <a id="example-app"></a>예시 앱

이 리포지토리의 [예시 앱][example-app]을 확인하여 SDK가 웹 앱에서 어떻게 사용되는지 확인할 수 있습니다.

## <a id="basic-integration"></a>기본 연동

이 SDK는 설치, 세션 및 이벤트 트래킹에 사용될 수 있습니다. Adjust JS SDK를 웹 앱에 추가하기만 하면 됩니다.

### <a id="recommendations"></a>권장 사항

웹 앱에 대한 광고 캠페인을 진행하지 않는 경우 네이티브 앱을 통해 유입되는 사용자와 웹 앱을 통해 유입되는 사용자를 구분할 수 있는 두 가지 방법이 있습니다.

- 웹 앱에 대한 Adjust 대시보드에서 새로운 앱을 만들고 생성 과정에서 지원되는 플랫폼 중 하나를 선택한 다음 이 앱 토큰을 Adjust SDK에서 사용하여 초기화합니다. 네이티브 앱과 마찬가지로, Adjust 대시보드에서 앱을 통해 유입된 오가닉 트래픽에 `오가닉` 트래커 레이블이 지정됩니다.
- 기존 앱 중 하나를 사용하여 Adjust SDK에서 사전 설치된 트래커 토큰을 하드코드합니다. Adjust 대시보드에서 앱을 통해 유입되는 모든 트래픽에 하드코드된 트래커 레이블이 지정됩니다.

### <a id="basic-setup"></a>기본 설정

JS SDK 구현 시 유의사항:

- SDK가 플랫폼을 읽을 수 없으므로 동적 방식으로 전달하거나 `os_name` 파라미터로 하드코드해야 합니다.
- 앱이 `gps_adid`, `idfa` 또는 `win_adid`와 같은 광고 ID에 액세스하거나 이를 각각의 파라미터로 전달할 수 없는 경우, 유사하게 빌드된 iOS 및 Android용 UUID 및 유사한 기기 ID를 Windows용 `win_adid`로 전달하는 것이 좋습니다. 이러한 ID는 앱에서 생성되어야 합니다.

이러한 점을 바탕으로 Adjust JS SDK의 초기화는 웹 앱 내에서 다음과 같이 실행됩니다.

```js
var _adjust = new Adjust({
  app_token: 'YourAppToken',
  environment: 'production', // or 'sandbox' in case you are testing SDK locally with your web app
  os_name: 'android',
  device_ids: {
    gps_adid: '5056e23a-dc1d-418f-b5a2-4ab3e75daab2' // each web app user needs to have unique identifier
  }
});

_adjust.trackSession(function (result) {
    console.log(result);
  }, function (errorMsg, error) {
    console.log(errorMsg, error);
  }
);
```

## <a id="additional-features"></a>부가 기능

Adjust JS SDK를 웹 앱으로 통합하면 다음과 같은 기능의 이점을 활용할 수 있습니다.

### <a id="event-tracking"></a>이벤트 트래킹

Adjust를 사용하여 이벤트를 트래킹할 수 있습니다. 특정 버튼에 대한 모든 탭을 트래킹하려는 경우를 가정해 보겠습니다. `abc123`과 같은 관련 이벤트 토큰이 있는 [대시보드](http://adjust.com)에서 새 이벤트 토큰을 만들 수 있습니다. 웹 앱에서 이 이벤트를 트래킹하려면 다음을 수행해야 합니다.

```js
var _eventConfig = {
  event_token: 'EventToken'
};

_adjust.trackEvent(_eventConfig, function (result) {
  successCb(result, 'event');
}, function (errorMsg, error) {
  errorCb(errorMsg, error, 'event');
});
```

### <a id="revenue-tracking"></a>매출 트래킹

웹 앱에서 발생한 구매를 트래킹하려는 경우 Adjust JS SDK로 트래킹되는 이벤트에 매출을 추가할 수 있습니다. 이렇게 하려면 이벤트 트래킹 시 `revenue` 및 `currency` 파라미터를 추가해야 합니다.

```js
var _eventConfig = {
  event_token: 'EventToken',
  revenue: 10,
  currency: 'EUR'
};

_adjust.trackEvent(_eventConfig, function (result) {
  console.log(result);
}, function (errorMsg, error) {
  console.log(errorMsg, error);
});
```

사용자가 통화 토큰을 설정하면 Adjust는 사용자의 선택에 따라 발생 매출을 보고 매출로 자동 전환합니다. [여기][currency-conversion] 에서 통화 전환에 대해 자세히 알아보세요.

[이벤트 트래킹 가이드](https://docs.adjust.com/en/event-tracking/#tracking-purchases-and-revenues)에서 매출 및 이벤트 트래킹에 대해 자세히 알아볼 수 있습니다.

### <a id="callback-parameters"></a>콜백 파라미터

[대시보드][dashboard] 에서 이벤트를 위한 콜백 URL을 등록할 수 있습니다. 그러면 Adjust는 이벤트가 트래킹될 때마다 해당 URL에 GET 요청을 보냅니다. `callback_params` 파라미터를 `trackEvent` 메서드로 전달된 맵 객체에 추가하여 해당 이벤트에 콜백 파라미터를 추가할 수 있습니다. 그런 다음 Adjust는 이러한 파라미터를 사용자의 콜백 URL에 추가합니다.

예를 들어, 사용자가 `http://www.mydomain.com/callback` URL을 등록했으며 다음과 같은 이벤트를 트래킹한다고 가정해 보겠습니다.

```js
var _eventConfig = {
  event_token: 'EventToken',
  callback_params: [{
    key: 'key',
    value: 'value'
  }, {
    key: 'foo',
    value: 'bar'
  }],
};

_adjust.trackEvent(_eventConfig, function (result) {
  console.log(result);
}, function (errorMsg, error) {
  console.log(errorMsg, error);
});
```

이 경우, Adjust가 이벤트를 트래킹하여 다음으로 요청을 전송합니다.

    http://www.mydomain.com/callback?key=value&foo=bar

Adjust는 `{gps_adid}` 등 파라미터 값으로 사용될 수 있는 다양한 placeholder를 지원합니다. 결과 콜백에서 이 placeholder는 현재 기기의 광고주 ID로 대체될 수 있습니다. Adjust는 커스텀 파라미터를 보관하지 않으며 콜백에 추가하기만 하기 때문에 콜백 없이는 커스텀 파라미터가 저장되거나 사용자에게 전송되지 않습니다.

Adjust [콜백 가이드](https://docs.adjust.com/en/callbacks)에서 사용 가능한 값의 전체 목록을 비롯하여 URL 콜백을 사용하는 방법을 자세히 알아보실 수 있습니다.

### <a id="partner-parameters"></a>파트너 파라미터

Adjust 대시보드에서 활성화된 네트워크 파트너로 전송될 파라미터를 추가할 수도 있습니다.

이는 앞서 언급한 콜백 파라미터와 유사하게 작동하지만, `partner_params` 파라미터를 `trackEvent` 메서드로 전달된 map object에 추가하는 방식이 있습니다. 

```js
var _eventConfig = {
  event_token: 'EventToken',
  partner_params: [{
    key: 'key',
    value: 'value'
  }, {
    key: 'foo',
    value: 'bar'
  }],
};

_adjust.trackEvent(_eventConfig, function (result) {
  console.log(result);
}, function (errorMsg, error) {
  console.log(errorMsg, error);
});
```

[특별 파트너 가이드][special-partners] 에서 특별 파트너와 연동 방법에 대한 자세한 내용을 알아보실 수 있습니다.

## <a id="license"></a>라이센스

Adjust SDK는 MIT 라이센스하에 사용이 허가됩니다.

Copyright (c) 2018 Adjust GmbH, http://www.adjust.com

다음 조건하에 본 소프트웨어와 관련 문서 파일(이하 "소프트웨어")의 사본을 보유한 제3자에게
소프트웨어의 사용, 복사, 수정, 병합, 게시, 배포, 재실시권 및/또는 사본의 판매 등을 포함하여
소프트웨어를 제한 없이 사용할 수 있는 권한을
무료로 부여하며,
소프트웨어를 보유한 이는 다음 조건에 따라
이러한 이용을 허가할 수 있습니다.

본 소프트웨어의 모든 사본 또는 상당 부분에
위 저작권 공고와 본 권한 공고를 포함해야 합니다.

소프트웨어는 "있는 그대로" 제공되며,
소프트웨어의 상품성과 특정 목적에의 적합성 및 비 침해성에 대해 명시적이거나 묵시적인 일체의 보증을 하지 않습니다.
저자 또는 저작권자는 본 소프트웨어나 이의 사용 또는
기타 소프트웨어 관련 거래로 인해 발생하는
모든 클레임, 손해 또는 기타 법적 책임에 있어서
계약 또는 불법 행위와 관련된 소송에 대해
어떠한 책임도 부담하지 않습니다.

[adjust.com]:   https://adjust.com
[dashboard]:    http://adjust.com
[example-app]:  index.js

[callbacks-guide]:      https://docs.adjust.com/en/callbacks
[special-partners]:     https://docs.adjust.com/en/special-partners
[currency-conversion]:  https://docs.adjust.com/en/event-tracking/#tracking-purchases-in-different-currencies
