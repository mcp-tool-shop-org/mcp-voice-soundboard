' Start voice-soundboard server silently on login
' Runs node with PORT=11435, no console window

Set shell = CreateObject("WScript.Shell")
shell.Environment("Process")("PORT") = "11435"

Dim scriptDir
scriptDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
Dim repoRoot
repoRoot = CreateObject("Scripting.FileSystemObject").GetParentFolderName(scriptDir)

shell.Run "node """ & repoRoot & "\packages\mcp-server\dist\cli.js""", 0, False
