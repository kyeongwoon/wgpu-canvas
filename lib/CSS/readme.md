- https://scientyficworld.org/css-parsing-explained/
- CSSOM -> CSSTOM으로 바뀌고 있음
    - 스타일 시트 파싱
        - text to 스타일 시트
            - 스타일 시트 : 룰 세튼
            - 룰 : 셀렉터 + Decl

**셀렉션 엔진과 스타일 매칭의 차이**

- 셀렉션 엔진
    - 해당 셀렉터에 해당하는 노드를 찾는다.
    - 해당 셀렉터에 해당하는 룰을 찾고
        - 클래스, ID, 스타일에 해당하는 노드를 찾는다.
    - 그 룰에 해당하는 노드를 찾는다.
    - 이걸 셀렉션 엔진이라고 하고, 패스트 셀렉션...
    - 셀렉션 엔진은 스타일만 위한것은 아니다. (수퍼 셋)
    - 셀렉터 파싱 엔진 별도 필요
        - css-what

- 엘리먼트의 스타일 매칭
    - 셀렉션 엔진의 스타일 매칭 부분만 활용
        - 셀럭터+Decl에서 Decl만 가져온다.
    - 두가지 키워드
        - 캐스케이딩 필요
        - 우선순위도
    - 룰에서 값을 뽑아냄
        - 인헤리트
        - 단위변환
    - 이 단위는 실제 값이 아님
        - 실제값은 뷰포트/상위 노드 있어야, 퍼센트 vw, vh 계산이 가능함

- https://css-tricks.com/css-cascade-layers/

### getcomputedstyle
- getMatchedCSSRules
    - cascade rule matcher
- 실제 값을 반환해야함
    - 현재는 퍼센트...

### browserx

### repaint

### nehan