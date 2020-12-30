---

title: Scoped Storage
date: "2020-04-04"
tags: ["Scoped Storage", "chocopie"]
description: ""
cover: "./preview.jpg"
---# Scoped Storage

> 사용자에게 파일에 대한 더 많은 권한을 주기 위해 앱 내부 디렉토리 및 앱에서 생성한 외부 디렉토리의 파일 외에는 접근이 제한

## 적용되는 버전

- TargetSdkVersion ≥ **29** 부터 적용
- 일시적으로 해제 가능 (기존 방식 사용)

## 앱 전용 디렉토리

- Internal
- External

### 파일타입

- persist file
- cache file
  - 일시적인 캐시 파일
  - 기기 메모리가 부족해지면 시스템에서 삭제할 수도 있음

### Internal

- 다른 앱이 접근할 수 없음

- Android 10 이상 기기부터는 암호화되는 공간

- Internal에 할당된 용량이 적기 때문에, 파일을 쓰기 전에 여유 공간 확인 필요

- persistent file

  ```kotlin
  //파일 접근 및 생성
  val file = File(context.filesDir, filename)
  ```

- cache file

  ```kotlin
  //생성
  File.createTempFile(filename, null, context.cacheDir)
  //접근
  val cacheFile = File(context.cacheDir, filename)
  ```

### External

- 사용자가 물리적으로 제거할 수도 있는 외장 공간 (ex, sd card)
- 권한을 가진 다른 앱이 접근할 수는 있지만, 이 공간의 의도는 소유한 앱에서만 되는 공간
  - -> 생성한 파일이 다른 앱에서도 접근 가능해야 한다면, External storage 보다는 공용 공간에 저장하는 것을 권장

```kotlin
//Persistent file
val appSpecificExternalDir = File(context.getExternalFilesDir(), filename)
//Cache file
val externalCacheFile = File(context.externalCacheDir, filename)
```

## 공용 공간의 파일 접근

- MediaStore
- Documents & etc.
- 다른 앱에서 접근 가능
- 파일을 생성한 앱이 삭제되더라도 파일 유지

## Media Store

- 시스템에서 파일 종류에 따라 public directory를 제공
- 이미지, 오디오, 비디오 등 파일 종류에 맞는 공통 공간에 저장됨

---- 이미지: 사진, 스크린샷 등 / `MediaStore.Images`

- 비디오: `MediaStore.Video`

- 오디오: `MediaStore.Audio`

- 다운로드 파일: Android 10 이상 기기부터 / `MediaStore.Downloads`

- MediaStore.Files
  - **Scoped Storage - On**: 앱이 생성한 이미지, 비디오, 오디오만 반환
  - **Scoped Storage - Off**: 모든 미디어 파일 반환

### Permission 변경사항

#### Scoped Storage - On

- 앱에서 생성한 미디어 파일에만 접근한다면 Android 10 이상 기기에서는 별도의 권한 요청이 필요없음

  - 28 이하 기기에서만 요청하도록 분기처리 가능

  ```xml
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
                     android:maxSdkVersion="28" />
  ```

- 다른 앱이 생성한 미디어 파일을 읽는다면 `READ_EXTERNAL_STORAGE` 권한 필요

- 미디어의 위치 정보를 가져오려면 `ACCESS_MEDIA_LOCATION` 권한 필요 -> 런타임 요청 권한

#### Scoped Storage - Off || 28이하 기기

- 동작에 따라 `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE` 권한 필요

### 미디어 공유

- `content://` URI 사용하여 공유

### 파일 경로로 미디어에 접근

예) /sdcard/DCIM/IMG1024.JPG

- Scoped Storage 사용하는 경우,

  ```
  READ_EXTERNAL_STORAGE
  ```

  권한이 있어도 앱 디렉토리가 아닌 파일은 경로로 접근 불가능

  - 앱별 디렉토리가 아닌 경우 `FileNotFoundException` 발생
  - 이유: /sdcard가 각 앱별 홈 디렉토리로 매핑 -> 실제로는 /sdcard/Android/sandbox/<package-name>/DCIM/IMG1024.JPG

- MediaStore API 사용해야 함

### 미디어 파일 추가하기

```kotlin
// Add a specific media item.
val resolver = applicationContext.contentResolver

// primary external storage에서 오디오 컬렉션 쿼리
val audioCollection = MediaStore.Audio.Media.getContentUri(
        MediaStore.VOLUME_EXTERNAL_PRIMARY) // API <= 28 : VOLUME_EXTERNAL 사용

// 새 오디오 컨텐트 생성
val newSongDetails = ContentValues().apply {
    put(MediaStore.Audio.Media.DISPLAY_NAME, "My Song.mp3")
}

// 나중에 수정이 필요할 때 이 URI 통해서 접근
val myFavoriteSongUri = resolver.insert(audioCollection, newSongDetails)
```

#### 파일 추가시 디렉토리 지정하기

Android 10 이상 기기에서는 dafault - 파일 타입 기반으로 분류 예) 이미지 파일을 추가하면 `Environment.DIRECTORY_PICTURES` 경로에 저장

Pictures/MyVacationPictures 처럼 하위 폴더를 지정하고 싶다면 파일 추가시 `MediaColumns.RELATIVE_PATH` 칼럼 설정

### 업데이트 / 삭제

#### 내 앱이 생성한 미디어

Scoped Storage On/Off에 상관없이 모두 동작

#### 다른 앱이 생성한 미디어 && Scoped Storage 사용

업데이트 / 삭제 동작이 필요할 때마다 해당 미디어 파일에 대한 권한을 받아야 함

예시 코드

```kotlin
try {
  contentResolver.openFileDescriptor(image-content-uri, "w")?.use {
      setGrayscaleFilter(it)
  }
} catch (securityException: SecurityException) {
  if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      val recoverableSecurityException = securityException as?
          RecoverableSecurityException ?:
          throw RuntimeException(securityException.message, securityException)

      val intentSender = recoverableSecurityException.userAction.actionIntent.intentSender
      intentSender?.let {
          //권한 요청
          startIntentSenderForResult(intentSender, image-request-code,
          null, 0, 0, 0, null)
      }
  } else {
      throw RuntimeException(securityException.message, securityException)
  }
}
```

### MediaStore가 아닌 다른 방법을 사용해야 하는 Use cases

#### 미디어 파일 여러 개를 처리하는 경우

`ACTION_OPEN_DOCUMENT_TREE` 인텐트 사용

#### 다른 타입의 파일을 처리하는 경우

MediaStore에서 인터페이스를 제공하지 않는 문서나 다른 파일은 `ACTION_OPEN_DOCUMENT` 인텐트 사용

## Documents & etc.

- 문서를 포함한 기타 파일

- Android 4.4부터 ACTION_OPEN_DOCUMENT 인텐트 추가
  - 시스템 파일 선택기를 통해 파일 선택 기능

| Action                    | OS Version | 역할                                                               |
| ------------------------- | ---------- | ------------------------------------------------------------------ |
| ACTION_GET_CONTENT        | 1 ~        | 단순히 데이터 읽고 가져오기 (사본을 읽어옴)                        |
| ACTION_OPEN_DOCUMENT      | 19 ~       | DocumentProvider의 파일에 장기적, 지속적 액세스 권한이 필요한 경우 |
| ACTION_OPEN_DOCUMENT_TREE | 21 ~       | 디렉토리 선택                                                      |

- 간단한 플로우
  1. 앱에서 파일 생성/열기 등 스토리지 관련 인텐트 실행
  2. 시스템 파일 선택기 UI 통해서 사용자가 파일 또는 디렉토리를 선택
  3. 앱이 해당 파일 또는 디렉토리의 권한을 얻어 URI를 통해 접근

### 파일 생성

- `ACTION_CREATE_DOCUMENT`

- 사용자가 시스템 파일 선택기 UI에서 파일을 저장할 위치 선택

- 덮어쓰기 지원 X -> 이름이 중복된 경우 파일 이름 뒤에 numbering

- Intent에 파일 선택기가 열릴 폴더의 URI 지정 가능 -

```
EXTRA_INITIAL_URI
```

- 유효하지 않은 경우 열릴 폴더를 시스템이 알아서 지정

```kotlin
// Request code for creating a PDF document.
const val CREATE_FILE = 1

private fun createFile(pickerInitialUri: Uri) {
    val intent = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
        addCategory(Intent.CATEGORY_OPENABLE)
        type = "application/pdf"
        putExtra(Intent.EXTRA_TITLE, "invoice.pdf")

        // Optional
        putExtra(DocumentsContract.EXTRA_INITIAL_URI, pickerInitialUri) //시스템 파일 선택기가 열릴 위치 지정
    }
    startActivityForResult(intent, CREATE_FILE)
}
```

### 파일 열기

- `ACTION_OPEN_DOCUMENT`
- `EXTRA_INITIAL_URI` 지정 가능

### 폴더에 대한 권한 얻기

- `ACTION_OPEN_DOCUMENT_TREE` (롤리팝 버전부터 추가)
- 선택한 폴더의 모든 하위 파일 및 폴더에 대한 권한
- `EXTRA_INITIAL_URI` 지정 가능

```kotlin
fun openDirectory(pickerInitialUri: Uri) {
    // Choose a directory using the system's file picker.
    val intent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE).apply {
        // Provide read access to files and sub-directories in the user-selected
        // directory.
        flags = Intent.FLAG_GRANT_READ_URI_PERMISSION

        // Optionally, specify a URI for the directory that should be opened in
        // the system file picker when it loads.
        putExtra(DocumentsContract.EXTRA_INITIAL_URI, pickerInitialUri)
    }

    startActivityForResult(intent, your-request-code)
}
```

### 권한 허용한 URI 얻기

```kotlin
override fun onActivityResult(
        requestCode: Int, resultCode: Int, resultData: Intent?) {
    if (requestCode == your-request-code
            && resultCode == Activity.RESULT_OK) {
        // The result data contains a URI for the document or directory that
        // the user selected.
        resultData?.data?.also { uri ->
            // Perform operations on the document using its URI.
        }
    }
}
```

### 영구적인 권한 얻기

- 일반적인 권한 요청은 기기 재시작 이후에 초기화됨
- 영구적인 권한을 얻으면 기기 재시작 후에도 권한 유지
  - 주의) 해당 파일/폴더가 이동 또는 삭제된 경우 유효하지 않으므로, 권한을 다시 받아야 함

```kotlin
val contentResolver = applicationContext.contentResolver

val takeFlags: Int = Intent.FLAG_GRANT_READ_URI_PERMISSION or
        Intent.FLAG_GRANT_WRITE_URI_PERMISSION
// Check for the freshest data.
contentResolver.takePersistableUriPermission(uri, takeFlags)
```

### 파일 목록 가져오기

```kotlin
val documentsTree = DocumentFile.fromTreeUri(getApplication(), directoryUri) ?: return
val childDocuments = documentsTree.listFiles().toCachingList()
```

### 삭제하기

```kotlin
DocumentsContract.deleteDocument(applicationContext.contentResolver, uri)
```
