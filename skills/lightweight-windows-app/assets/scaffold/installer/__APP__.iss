#ifndef AppVersion
  #error AppVersion must come from VERSION via scripts/build-installer.ps1
#endif
#define AppMutexName "Local\__APP__.SingleInstance"

[Setup]
AppId={{__GUID__}
AppName=__APP__
AppVersion={#AppVersion}
VersionInfoVersion={#AppVersion}
AppPublisher=__PUBLISHER__
AppPublisherURL=__REPO_URL__
DefaultDirName={localappdata}\Programs\__APP__
DisableProgramGroupPage=yes
DisableDirPage=yes
DisableReadyPage=yes
DisableWelcomePage=yes
PrivilegesRequired=lowest
MinVersion=10.0.14393
OutputDir=..\artifacts
OutputBaseFilename=__APP__-Setup-{#AppVersion}
SetupIconFile=..\assets\__APP_LOWER__.ico
UninstallDisplayIcon={app}\__APP__.exe
UninstallDisplayName=__APP__
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
WizardImageFile=..\assets\installer\wizard-164x314.bmp,..\assets\installer\wizard-328x628.bmp
WizardSmallImageFile=..\assets\installer\wizard-small-55x58.bmp,..\assets\installer\wizard-small-110x116.bmp
CloseApplications=no
RestartApplications=no
AppMutex={#AppMutexName}

[Languages]
Name: "brazilianportuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"

[Files]
Source: "..\src\__APP__\bin\Release\net48\__APP__.exe"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{autoprograms}\__APP__"; Filename: "{app}\__APP__.exe"

[Run]
Filename: "{app}\__APP__.exe"; Description: "Abrir o __APP__"; Flags: nowait postinstall skipifsilent

[Registry]
; Created by the "Iniciar com o Windows" setting; removed with the app, and nothing else in the key is touched.
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueName: "__APP__"; Flags: uninsdeletevalue dontcreatekey

[Code]
procedure CloseRunningApp();
var
  Window: HWND;
  Attempt: Integer;
begin
  Window := FindWindowByWindowName('__APP__.Host');
  if Window <> 0 then
    PostMessage(Window, $0010, 0, 0);
  for Attempt := 1 to 40 do begin
    if not CheckForMutexes('{#AppMutexName}') then
      Exit;
    Sleep(100);
  end;
end;

{ Inno checks AppMutex right after these, so the app must leave first. If it did not, that check tells the user. }
function InitializeSetup(): Boolean;
begin
  CloseRunningApp();
  Result := True;
end;

function InitializeUninstall(): Boolean;
begin
  CloseRunningApp();
  Result := True;
end;
