package xyz.kabarbaik.qwenpad.git;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class Git extends CordovaPlugin {
    
    public static final String TAG = "GitPlugin";
    private ExecutorService executorService;

    @Override
    protected void pluginInitialize() {
        super.pluginInitialize();
        this.executorService = Executors.newCachedThreadPool();
        Log.d(TAG, "Git plugin initialized");
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        try {
            if (action.equals("init")) {
                init(args, callbackContext);
                return true;
            } else if (action.equals("clone")) {
                clone(args, callbackContext);
                return true;
            } else if (action.equals("add")) {
                add(args, callbackContext);
                return true;
            } else if (action.equals("commit")) {
                commit(args, callbackContext);
                return true;
            } else if (action.equals("push")) {
                push(args, callbackContext);
                return true;
            } else if (action.equals("pull")) {
                pull(args, callbackContext);
                return true;
            } else if (action.equals("fetch")) {
                fetch(args, callbackContext);
                return true;
            } else if (action.equals("createBranch")) {
                createBranch(args, callbackContext);
                return true;
            } else if (action.equals("switchBranch")) {
                switchBranch(args, callbackContext);
                return true;
            } else if (action.equals("merge")) {
                merge(args, callbackContext);
                return true;
            } else if (action.equals("status")) {
                status(args, callbackContext);
                return true;
            } else if (action.equals("log")) {
                log(args, callbackContext);
                return true;
            } else if (action.equals("getCurrentBranch")) {
                getCurrentBranch(args, callbackContext);
                return true;
            } else if (action.equals("getBranches")) {
                getBranches(args, callbackContext);
                return true;
            } else if (action.equals("getRemotes")) {
                getRemotes(args, callbackContext);
                return true;
            } else if (action.equals("addRemote")) {
                addRemote(args, callbackContext);
                return true;
            } else if (action.equals("removeRemote")) {
                removeRemote(args, callbackContext);
                return true;
            } else if (action.equals("diff")) {
                diff(args, callbackContext);
                return true;
            } else if (action.equals("reset")) {
                reset(args, callbackContext);
                return true;
            } else if (action.equals("revert")) {
                revert(args, callbackContext);
                return true;
            } else if (action.equals("stash")) {
                stash(args, callbackContext);
                return true;
            } else if (action.equals("stashApply")) {
                stashApply(args, callbackContext);
                return true;
            } else if (action.equals("stashList")) {
                stashList(args, callbackContext);
                return true;
            } else if (action.equals("remove")) {
                remove(args, callbackContext);
                return true;
            } else if (action.equals("tag")) {
                tag(args, callbackContext);
                return true;
            } else if (action.equals("getTags")) {
                getTags(args, callbackContext);
                return true;
            } else if (action.equals("isRepository")) {
                isRepository(args, callbackContext);
                return true;
            } else {
                callbackContext.error("Invalid action: " + action);
                return false;
            }
        } catch (Exception e) {
            Log.e(TAG, "Error executing " + action, e);
            callbackContext.error(e.getMessage());
            return false;
        }
    }

    private void init(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        
        executorService.execute(() -> {
            try {
                // Execute git init command
                String command = "git init \"" + path + "\"";
                Process process = Runtime.getRuntime().exec(command);
                int exitCode = process.waitFor();
                
                if (exitCode == 0) {
                    callbackContext.success("Repository initialized successfully");
                } else {
                    callbackContext.error("Failed to initialize repository");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error initializing repository", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void clone(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String url = args.getString(0);
        String path = args.getString(1);
        JSONObject options = args.getJSONObject(2);
        
        executorService.execute(() -> {
            try {
                StringBuilder commandBuilder = new StringBuilder("git clone ");
                
                // Add options if any
                if (options.has("depth")) {
                    commandBuilder.append("--depth ").append(options.getInt("depth")).append(" ");
                }
                
                if (options.has("branch")) {
                    commandBuilder.append("--branch ").append(options.getString("branch")).append(" ");
                }
                
                commandBuilder.append("\"").append(url).append("\" \"").append(path).append("\"");
                
                String command = commandBuilder.toString();
                Process process = Runtime.getRuntime().exec(command);
                int exitCode = process.waitFor();
                
                if (exitCode == 0) {
                    callbackContext.success("Repository cloned successfully");
                } else {
                    callbackContext.error("Failed to clone repository");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error cloning repository", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void add(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        JSONArray files = args.getJSONArray(1);
        
        executorService.execute(() -> {
            try {
                StringBuilder commandBuilder = new StringBuilder("cd \"" + path + "\" && git add ");
                
                for (int i = 0; i < files.length(); i++) {
                    commandBuilder.append("\"").append(files.getString(i)).append("\" ");
                }
                
                String command = commandBuilder.toString().trim();
                Process process = Runtime.getRuntime().exec(command);
                int exitCode = process.waitFor();
                
                if (exitCode == 0) {
                    callbackContext.success("Files added to staging area");
                } else {
                    callbackContext.error("Failed to add files");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error adding files", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void commit(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        String message = args.getString(1);
        JSONObject options = args.getJSONObject(2);
        
        executorService.execute(() -> {
            try {
                StringBuilder commandBuilder = new StringBuilder("cd \"" + path + "\" && git commit -m \"" + message + "\"");
                
                if (options.has("all") && options.getBoolean("all")) {
                    commandBuilder.append(" --all");
                }
                
                String command = commandBuilder.toString();
                Process process = Runtime.getRuntime().exec(command);
                int exitCode = process.waitFor();
                
                if (exitCode == 0) {
                    callbackContext.success("Changes committed successfully");
                } else {
                    callbackContext.error("Failed to commit changes");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error committing changes", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void push(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        String remote = args.getString(1);
        String branch = args.getString(2);
        JSONObject options = args.getJSONObject(3);
        
        executorService.execute(() -> {
            try {
                StringBuilder commandBuilder = new StringBuilder("cd \"" + path + "\" && git push " + remote + " " + branch);
                
                if (options.has("force") && options.getBoolean("force")) {
                    commandBuilder.append(" --force");
                }
                
                if (options.has("setUpstream") && options.getBoolean("setUpstream")) {
                    commandBuilder.append(" --set-upstream");
                }
                
                String command = commandBuilder.toString();
                Process process = Runtime.getRuntime().exec(command);
                int exitCode = process.waitFor();
                
                if (exitCode == 0) {
                    callbackContext.success("Changes pushed successfully");
                } else {
                    callbackContext.error("Failed to push changes");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error pushing changes", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void pull(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        String remote = args.getString(1);
        String branch = args.getString(2);
        JSONObject options = args.getJSONObject(3);
        
        executorService.execute(() -> {
            try {
                StringBuilder commandBuilder = new StringBuilder("cd \"" + path + "\" && git pull " + remote + " " + branch);
                
                if (options.has("rebase") && options.getBoolean("rebase")) {
                    commandBuilder.append(" --rebase");
                }
                
                String command = commandBuilder.toString();
                Process process = Runtime.getRuntime().exec(command);
                int exitCode = process.waitFor();
                
                if (exitCode == 0) {
                    callbackContext.success("Changes pulled successfully");
                } else {
                    callbackContext.error("Failed to pull changes");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error pulling changes", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void fetch(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        String remote = args.getString(1);
        JSONObject options = args.getJSONObject(2);
        
        executorService.execute(() -> {
            try {
                StringBuilder commandBuilder = new StringBuilder("cd \"" + path + "\" && git fetch " + remote);
                
                if (options.has("all") && options.getBoolean("all")) {
                    commandBuilder.append(" --all");
                }
                
                if (options.has("prune") && options.getBoolean("prune")) {
                    commandBuilder.append(" --prune");
                }
                
                String command = commandBuilder.toString();
                Process process = Runtime.getRuntime().exec(command);
                int exitCode = process.waitFor();
                
                if (exitCode == 0) {
                    callbackContext.success("Fetch completed successfully");
                } else {
                    callbackContext.error("Failed to fetch");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error fetching", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void createBranch(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        String branchName = args.getString(1);
        
        executorService.execute(() -> {
            try {
                String command = "cd \"" + path + "\" && git branch " + branchName;
                Process process = Runtime.getRuntime().exec(command);
                int exitCode = process.waitFor();
                
                if (exitCode == 0) {
                    callbackContext.success("Branch created successfully");
                } else {
                    callbackContext.error("Failed to create branch");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error creating branch", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void switchBranch(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        String branchName = args.getString(1);
        
        executorService.execute(() -> {
            try {
                String command = "cd \"" + path + "\" && git switch " + branchName;
                Process process = Runtime.getRuntime().exec(command);
                int exitCode = process.waitFor();
                
                if (exitCode == 0) {
                    callbackContext.success("Switched to branch " + branchName);
                } else {
                    callbackContext.error("Failed to switch branch");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error switching branch", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void merge(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        String branchName = args.getString(1);
        JSONObject options = args.getJSONObject(2);
        
        executorService.execute(() -> {
            try {
                StringBuilder commandBuilder = new StringBuilder("cd \"" + path + "\" && git merge " + branchName);
                
                if (options.has("noFastForward") && options.getBoolean("noFastForward")) {
                    commandBuilder.append(" --no-ff");
                }
                
                if (options.has("squash") && options.getBoolean("squash")) {
                    commandBuilder.append(" --squash");
                }
                
                String command = commandBuilder.toString();
                Process process = Runtime.getRuntime().exec(command);
                int exitCode = process.waitFor();
                
                if (exitCode == 0) {
                    callbackContext.success("Merge completed successfully");
                } else {
                    callbackContext.error("Failed to merge");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error merging", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void status(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        
        executorService.execute(() -> {
            try {
                String command = "cd \"" + path + "\" && git status --porcelain";
                Process process = Runtime.getRuntime().exec(command);
                
                StringBuilder output = new StringBuilder();
                java.util.Scanner scanner = new java.util.Scanner(process.getInputStream());
                while (scanner.hasNextLine()) {
                    output.append(scanner.nextLine()).append("\n");
                }
                scanner.close();
                
                int exitCode = process.waitFor();
                
                JSONObject result = new JSONObject();
                result.put("status", output.toString());
                result.put("exitCode", exitCode);
                
                callbackContext.success(result);
            } catch (Exception e) {
                Log.e(TAG, "Error getting status", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void log(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        JSONObject options = args.getJSONObject(1);
        
        executorService.execute(() -> {
            try {
                StringBuilder commandBuilder = new StringBuilder("cd \"" + path + "\" && git log --oneline");
                
                if (options.has("maxCount")) {
                    commandBuilder.append(" -n ").append(options.getInt("maxCount"));
                }
                
                if (options.has("since")) {
                    commandBuilder.append(" --since=\"").append(options.getString("since")).append("\"");
                }
                
                if (options.has("until")) {
                    commandBuilder.append(" --until=\"").append(options.getString("until")).append("\"");
                }
                
                if (options.has("author")) {
                    commandBuilder.append(" --author=\"").append(options.getString("author")).append("\"");
                }
                
                String command = commandBuilder.toString();
                Process process = Runtime.getRuntime().exec(command);
                
                StringBuilder output = new StringBuilder();
                java.util.Scanner scanner = new java.util.Scanner(process.getInputStream());
                while (scanner.hasNextLine()) {
                    output.append(scanner.nextLine()).append("\n");
                }
                scanner.close();
                
                int exitCode = process.waitFor();
                
                JSONObject result = new JSONObject();
                result.put("log", output.toString());
                result.put("exitCode", exitCode);
                
                callbackContext.success(result);
            } catch (Exception e) {
                Log.e(TAG, "Error getting log", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void getCurrentBranch(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        
        executorService.execute(() -> {
            try {
                String command = "cd \"" + path + "\" && git rev-parse --abbrev-ref HEAD";
                Process process = Runtime.getRuntime().exec(command);
                
                StringBuilder output = new StringBuilder();
                java.util.Scanner scanner = new java.util.Scanner(process.getInputStream());
                while (scanner.hasNextLine()) {
                    output.append(scanner.nextLine()).append("\n");
                }
                scanner.close();
                
                int exitCode = process.waitFor();
                
                if (exitCode == 0) {
                    callbackContext.success(output.toString().trim());
                } else {
                    callbackContext.error("Failed to get current branch");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error getting current branch", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void getBranches(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        
        executorService.execute(() -> {
            try {
                String command = "cd \"" + path + "\" && git branch";
                Process process = Runtime.getRuntime().exec(command);
                
                StringBuilder output = new StringBuilder();
                java.util.Scanner scanner = new java.util.Scanner(process.getInputStream());
                while (scanner.hasNextLine()) {
                    output.append(scanner.nextLine()).append("\n");
                }
                scanner.close();
                
                int exitCode = process.waitFor();
                
                if (exitCode == 0) {
                    callbackContext.success(output.toString());
                } else {
                    callbackContext.error("Failed to get branches");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error getting branches", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void getRemotes(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        
        executorService.execute(() -> {
            try {
                String command = "cd \"" + path + "\" && git remote -v";
                Process process = Runtime.getRuntime().exec(command);
                
                StringBuilder output = new StringBuilder();
                java.util.Scanner scanner = new java.util.Scanner(process.getInputStream());
                while (scanner.hasNextLine()) {
                    output.append(scanner.nextLine()).append("\n");
                }
                scanner.close();
                
                int exitCode = process.waitFor();
                
                if (exitCode == 0) {
                    callbackContext.success(output.toString());
                } else {
                    callbackContext.error("Failed to get remotes");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error getting remotes", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void addRemote(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        String name = args.getString(1);
        String url = args.getString(2);
        
        executorService.execute(() -> {
            try {
                String command = "cd \"" + path + "\" && git remote add " + name + " " + url;
                Process process = Runtime.getRuntime().exec(command);
                int exitCode = process.waitFor();
                
                if (exitCode == 0) {
                    callbackContext.success("Remote added successfully");
                } else {
                    callbackContext.error("Failed to add remote");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error adding remote", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void removeRemote(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        String name = args.getString(1);
        
        executorService.execute(() -> {
            try {
                String command = "cd \"" + path + "\" && git remote remove " + name;
                Process process = Runtime.getRuntime().exec(command);
                int exitCode = process.waitFor();
                
                if (exitCode == 0) {
                    callbackContext.success("Remote removed successfully");
                } else {
                    callbackContext.error("Failed to remove remote");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error removing remote", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void diff(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        JSONObject options = args.getJSONObject(1);
        
        executorService.execute(() -> {
            try {
                StringBuilder commandBuilder = new StringBuilder("cd \"" + path + "\" && git diff");
                
                if (options.has("cached") && options.getBoolean("cached")) {
                    commandBuilder.append(" --cached");
                }
                
                if (options.has("staged") && options.getBoolean("staged")) {
                    commandBuilder.append(" --staged");
                }
                
                String command = commandBuilder.toString();
                Process process = Runtime.getRuntime().exec(command);
                
                StringBuilder output = new StringBuilder();
                java.util.Scanner scanner = new java.util.Scanner(process.getInputStream());
                while (scanner.hasNextLine()) {
                    output.append(scanner.nextLine()).append("\n");
                }
                scanner.close();
                
                int exitCode = process.waitFor();
                
                JSONObject result = new JSONObject();
                result.put("diff", output.toString());
                result.put("exitCode", exitCode);
                
                callbackContext.success(result);
            } catch (Exception e) {
                Log.e(TAG, "Error getting diff", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void reset(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        String mode = args.getString(1);
        String commit = args.getString(2);
        
        executorService.execute(() -> {
            try {
                StringBuilder commandBuilder = new StringBuilder("cd \"" + path + "\" && git reset");
                
                if (mode != null && !mode.isEmpty()) {
                    commandBuilder.append(" --").append(mode);
                }
                
                if (commit != null && !commit.isEmpty()) {
                    commandBuilder.append(" ").append(commit);
                }
                
                String command = commandBuilder.toString();
                Process process = Runtime.getRuntime().exec(command);
                int exitCode = process.waitFor();
                
                if (exitCode == 0) {
                    callbackContext.success("Reset completed successfully");
                } else {
                    callbackContext.error("Failed to reset");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error resetting", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void revert(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        JSONArray commits = args.getJSONArray(1);
        JSONObject options = args.getJSONObject(2);
        
        executorService.execute(() -> {
            try {
                StringBuilder commandBuilder = new StringBuilder("cd \"" + path + "\" && git revert");
                
                if (options.has("noCommit") && options.getBoolean("noCommit")) {
                    commandBuilder.append(" --no-commit");
                }
                
                for (int i = 0; i < commits.length(); i++) {
                    commandBuilder.append(" ").append(commits.getString(i));
                }
                
                String command = commandBuilder.toString();
                Process process = Runtime.getRuntime().exec(command);
                int exitCode = process.waitFor();
                
                if (exitCode == 0) {
                    callbackContext.success("Revert completed successfully");
                } else {
                    callbackContext.error("Failed to revert");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error reverting", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void stash(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        JSONObject options = args.getJSONObject(1);
        
        executorService.execute(() -> {
            try {
                StringBuilder commandBuilder = new StringBuilder("cd \"" + path + "\" && git stash");
                
                if (options.has("includeUntracked") && options.getBoolean("includeUntracked")) {
                    commandBuilder.append(" --include-untracked");
                }
                
                if (options.has("all") && options.getBoolean("all")) {
                    commandBuilder.append(" --all");
                }
                
                if (options.has("message")) {
                    commandBuilder.append(" save \"").append(options.getString("message")).append("\"");
                }
                
                String command = commandBuilder.toString();
                Process process = Runtime.getRuntime().exec(command);
                int exitCode = process.waitFor();
                
                if (exitCode == 0) {
                    callbackContext.success("Stash completed successfully");
                } else {
                    callbackContext.error("Failed to stash");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error stashing", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void stashApply(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        String stashRef = args.getString(1);
        JSONObject options = args.getJSONObject(2);
        
        executorService.execute(() -> {
            try {
                StringBuilder commandBuilder = new StringBuilder("cd \"" + path + "\" && git stash apply");
                
                if (options.has("index") && options.getBoolean("index")) {
                    commandBuilder.append(" --index");
                }
                
                if (stashRef != null && !stashRef.isEmpty()) {
                    commandBuilder.append(" ").append(stashRef);
                }
                
                String command = commandBuilder.toString();
                Process process = Runtime.getRuntime().exec(command);
                int exitCode = process.waitFor();
                
                if (exitCode == 0) {
                    callbackContext.success("Stash applied successfully");
                } else {
                    callbackContext.error("Failed to apply stash");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error applying stash", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void stashList(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        
        executorService.execute(() -> {
            try {
                String command = "cd \"" + path + "\" && git stash list";
                Process process = Runtime.getRuntime().exec(command);
                
                StringBuilder output = new StringBuilder();
                java.util.Scanner scanner = new java.util.Scanner(process.getInputStream());
                while (scanner.hasNextLine()) {
                    output.append(scanner.nextLine()).append("\n");
                }
                scanner.close();
                
                int exitCode = process.waitFor();
                
                if (exitCode == 0) {
                    callbackContext.success(output.toString());
                } else {
                    callbackContext.error("Failed to list stashes");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error listing stashes", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void remove(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        JSONArray files = args.getJSONArray(1);
        JSONObject options = args.getJSONObject(2);
        
        executorService.execute(() -> {
            try {
                StringBuilder commandBuilder = new StringBuilder("cd \"" + path + "\" && git rm");
                
                if (options.has("cached") && options.getBoolean("cached")) {
                    commandBuilder.append(" --cached");
                }
                
                if (options.has("force") && options.getBoolean("force")) {
                    commandBuilder.append(" --force");
                }
                
                for (int i = 0; i < files.length(); i++) {
                    commandBuilder.append(" \"").append(files.getString(i)).append("\"");
                }
                
                String command = commandBuilder.toString();
                Process process = Runtime.getRuntime().exec(command);
                int exitCode = process.waitFor();
                
                if (exitCode == 0) {
                    callbackContext.success("Files removed successfully");
                } else {
                    callbackContext.error("Failed to remove files");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error removing files", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void tag(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        String tagName = args.getString(1);
        String message = args.getString(2);
        JSONObject options = args.getJSONObject(3);
        
        executorService.execute(() -> {
            try {
                StringBuilder commandBuilder = new StringBuilder("cd \"" + path + "\" && git tag");
                
                if (message != null && !message.isEmpty()) {
                    commandBuilder.append(" -m \"").append(message).append("\"");
                }
                
                if (options.has("annotate") && options.getBoolean("annotate")) {
                    commandBuilder.append(" -a");
                }
                
                commandBuilder.append(" ").append(tagName);
                
                String command = commandBuilder.toString();
                Process process = Runtime.getRuntime().exec(command);
                int exitCode = process.waitFor();
                
                if (exitCode == 0) {
                    callbackContext.success("Tag created successfully");
                } else {
                    callbackContext.error("Failed to create tag");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error creating tag", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void getTags(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        
        executorService.execute(() -> {
            try {
                String command = "cd \"" + path + "\" && git tag";
                Process process = Runtime.getRuntime().exec(command);
                
                StringBuilder output = new StringBuilder();
                java.util.Scanner scanner = new java.util.Scanner(process.getInputStream());
                while (scanner.hasNextLine()) {
                    output.append(scanner.nextLine()).append("\n");
                }
                scanner.close();
                
                int exitCode = process.waitFor();
                
                if (exitCode == 0) {
                    callbackContext.success(output.toString());
                } else {
                    callbackContext.error("Failed to get tags");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error getting tags", e);
                callbackContext.error(e.getMessage());
            }
        });
    }

    private void isRepository(JSONArray args, CallbackContext callbackContext) throws JSONException {
        String path = args.getString(0);
        
        executorService.execute(() -> {
            try {
                String command = "cd \"" + path + "\" && git rev-parse --git-dir";
                Process process = Runtime.getRuntime().exec(command);
                int exitCode = process.waitFor();
                
                callbackContext.success(exitCode == 0 ? "true" : "false");
            } catch (Exception e) {
                Log.e(TAG, "Error checking if repository", e);
                callbackContext.success("false");
            }
        });
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (executorService != null) {
            executorService.shutdown();
        }
    }
}