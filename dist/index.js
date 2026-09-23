#!/usr/bin/env node
import { createRequire as __createRequire } from "module"; const require = __createRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/commander@14.0.3/node_modules/commander/lib/error.js
var require_error = __commonJS({
  "node_modules/.pnpm/commander@14.0.3/node_modules/commander/lib/error.js"(exports) {
    var CommanderError2 = class extends Error {
      /**
       * Constructs the CommanderError class
       * @param {number} exitCode suggested exit code which could be used with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       */
      constructor(exitCode, code, message) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.code = code;
        this.exitCode = exitCode;
        this.nestedError = void 0;
      }
    };
    var InvalidArgumentError2 = class extends CommanderError2 {
      /**
       * Constructs the InvalidArgumentError class
       * @param {string} [message] explanation of why argument is invalid
       */
      constructor(message) {
        super(1, "commander.invalidArgument", message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
      }
    };
    exports.CommanderError = CommanderError2;
    exports.InvalidArgumentError = InvalidArgumentError2;
  }
});

// node_modules/.pnpm/commander@14.0.3/node_modules/commander/lib/argument.js
var require_argument = __commonJS({
  "node_modules/.pnpm/commander@14.0.3/node_modules/commander/lib/argument.js"(exports) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Argument2 = class {
      /**
       * Initialize a new command argument with the given name and description.
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @param {string} name
       * @param {string} [description]
       */
      constructor(name, description) {
        this.description = description || "";
        this.variadic = false;
        this.parseArg = void 0;
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.argChoices = void 0;
        switch (name[0]) {
          case "<":
            this.required = true;
            this._name = name.slice(1, -1);
            break;
          case "[":
            this.required = false;
            this._name = name.slice(1, -1);
            break;
          default:
            this.required = true;
            this._name = name;
            break;
        }
        if (this._name.endsWith("...")) {
          this.variadic = true;
          this._name = this._name.slice(0, -3);
        }
      }
      /**
       * Return argument name.
       *
       * @return {string}
       */
      name() {
        return this._name;
      }
      /**
       * @package
       */
      _collectValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        previous.push(value);
        return previous;
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {*} value
       * @param {string} [description]
       * @return {Argument}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Set the custom handler for processing CLI command arguments into argument values.
       *
       * @param {Function} [fn]
       * @return {Argument}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Only allow argument value to be one of choices.
       *
       * @param {string[]} values
       * @return {Argument}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(
              `Allowed choices are ${this.argChoices.join(", ")}.`
            );
          }
          if (this.variadic) {
            return this._collectValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Make argument required.
       *
       * @returns {Argument}
       */
      argRequired() {
        this.required = true;
        return this;
      }
      /**
       * Make argument optional.
       *
       * @returns {Argument}
       */
      argOptional() {
        this.required = false;
        return this;
      }
    };
    function humanReadableArgName(arg) {
      const nameOutput = arg.name() + (arg.variadic === true ? "..." : "");
      return arg.required ? "<" + nameOutput + ">" : "[" + nameOutput + "]";
    }
    exports.Argument = Argument2;
    exports.humanReadableArgName = humanReadableArgName;
  }
});

// node_modules/.pnpm/commander@14.0.3/node_modules/commander/lib/help.js
var require_help = __commonJS({
  "node_modules/.pnpm/commander@14.0.3/node_modules/commander/lib/help.js"(exports) {
    var { humanReadableArgName } = require_argument();
    var Help2 = class {
      constructor() {
        this.helpWidth = void 0;
        this.minWidthToWrap = 40;
        this.sortSubcommands = false;
        this.sortOptions = false;
        this.showGlobalOptions = false;
      }
      /**
       * prepareContext is called by Commander after applying overrides from `Command.configureHelp()`
       * and just before calling `formatHelp()`.
       *
       * Commander just uses the helpWidth and the rest is provided for optional use by more complex subclasses.
       *
       * @param {{ error?: boolean, helpWidth?: number, outputHasColors?: boolean }} contextOptions
       */
      prepareContext(contextOptions) {
        this.helpWidth = this.helpWidth ?? contextOptions.helpWidth ?? 80;
      }
      /**
       * Get an array of the visible subcommands. Includes a placeholder for the implicit help command, if there is one.
       *
       * @param {Command} cmd
       * @returns {Command[]}
       */
      visibleCommands(cmd) {
        const visibleCommands = cmd.commands.filter((cmd2) => !cmd2._hidden);
        const helpCommand = cmd._getHelpCommand();
        if (helpCommand && !helpCommand._hidden) {
          visibleCommands.push(helpCommand);
        }
        if (this.sortSubcommands) {
          visibleCommands.sort((a, b) => {
            return a.name().localeCompare(b.name());
          });
        }
        return visibleCommands;
      }
      /**
       * Compare options for sort.
       *
       * @param {Option} a
       * @param {Option} b
       * @returns {number}
       */
      compareOptions(a, b) {
        const getSortKey = (option) => {
          return option.short ? option.short.replace(/^-/, "") : option.long.replace(/^--/, "");
        };
        return getSortKey(a).localeCompare(getSortKey(b));
      }
      /**
       * Get an array of the visible options. Includes a placeholder for the implicit help option, if there is one.
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleOptions(cmd) {
        const visibleOptions = cmd.options.filter((option) => !option.hidden);
        const helpOption = cmd._getHelpOption();
        if (helpOption && !helpOption.hidden) {
          const removeShort = helpOption.short && cmd._findOption(helpOption.short);
          const removeLong = helpOption.long && cmd._findOption(helpOption.long);
          if (!removeShort && !removeLong) {
            visibleOptions.push(helpOption);
          } else if (helpOption.long && !removeLong) {
            visibleOptions.push(
              cmd.createOption(helpOption.long, helpOption.description)
            );
          } else if (helpOption.short && !removeShort) {
            visibleOptions.push(
              cmd.createOption(helpOption.short, helpOption.description)
            );
          }
        }
        if (this.sortOptions) {
          visibleOptions.sort(this.compareOptions);
        }
        return visibleOptions;
      }
      /**
       * Get an array of the visible global options. (Not including help.)
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleGlobalOptions(cmd) {
        if (!this.showGlobalOptions) return [];
        const globalOptions = [];
        for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
          const visibleOptions = ancestorCmd.options.filter(
            (option) => !option.hidden
          );
          globalOptions.push(...visibleOptions);
        }
        if (this.sortOptions) {
          globalOptions.sort(this.compareOptions);
        }
        return globalOptions;
      }
      /**
       * Get an array of the arguments if any have a description.
       *
       * @param {Command} cmd
       * @returns {Argument[]}
       */
      visibleArguments(cmd) {
        if (cmd._argsDescription) {
          cmd.registeredArguments.forEach((argument) => {
            argument.description = argument.description || cmd._argsDescription[argument.name()] || "";
          });
        }
        if (cmd.registeredArguments.find((argument) => argument.description)) {
          return cmd.registeredArguments;
        }
        return [];
      }
      /**
       * Get the command term to show in the list of subcommands.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandTerm(cmd) {
        const args = cmd.registeredArguments.map((arg) => humanReadableArgName(arg)).join(" ");
        return cmd._name + (cmd._aliases[0] ? "|" + cmd._aliases[0] : "") + (cmd.options.length ? " [options]" : "") + // simplistic check for non-help option
        (args ? " " + args : "");
      }
      /**
       * Get the option term to show in the list of options.
       *
       * @param {Option} option
       * @returns {string}
       */
      optionTerm(option) {
        return option.flags;
      }
      /**
       * Get the argument term to show in the list of arguments.
       *
       * @param {Argument} argument
       * @returns {string}
       */
      argumentTerm(argument) {
        return argument.name();
      }
      /**
       * Get the longest command term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestSubcommandTermLength(cmd, helper) {
        return helper.visibleCommands(cmd).reduce((max, command) => {
          return Math.max(
            max,
            this.displayWidth(
              helper.styleSubcommandTerm(helper.subcommandTerm(command))
            )
          );
        }, 0);
      }
      /**
       * Get the longest option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestOptionTermLength(cmd, helper) {
        return helper.visibleOptions(cmd).reduce((max, option) => {
          return Math.max(
            max,
            this.displayWidth(helper.styleOptionTerm(helper.optionTerm(option)))
          );
        }, 0);
      }
      /**
       * Get the longest global option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestGlobalOptionTermLength(cmd, helper) {
        return helper.visibleGlobalOptions(cmd).reduce((max, option) => {
          return Math.max(
            max,
            this.displayWidth(helper.styleOptionTerm(helper.optionTerm(option)))
          );
        }, 0);
      }
      /**
       * Get the longest argument term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestArgumentTermLength(cmd, helper) {
        return helper.visibleArguments(cmd).reduce((max, argument) => {
          return Math.max(
            max,
            this.displayWidth(
              helper.styleArgumentTerm(helper.argumentTerm(argument))
            )
          );
        }, 0);
      }
      /**
       * Get the command usage to be displayed at the top of the built-in help.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandUsage(cmd) {
        let cmdName = cmd._name;
        if (cmd._aliases[0]) {
          cmdName = cmdName + "|" + cmd._aliases[0];
        }
        let ancestorCmdNames = "";
        for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
          ancestorCmdNames = ancestorCmd.name() + " " + ancestorCmdNames;
        }
        return ancestorCmdNames + cmdName + " " + cmd.usage();
      }
      /**
       * Get the description for the command.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandDescription(cmd) {
        return cmd.description();
      }
      /**
       * Get the subcommand summary to show in the list of subcommands.
       * (Fallback to description for backwards compatibility.)
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandDescription(cmd) {
        return cmd.summary() || cmd.description();
      }
      /**
       * Get the option description to show in the list of options.
       *
       * @param {Option} option
       * @return {string}
       */
      optionDescription(option) {
        const extraInfo = [];
        if (option.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (option.defaultValue !== void 0) {
          const showDefault = option.required || option.optional || option.isBoolean() && typeof option.defaultValue === "boolean";
          if (showDefault) {
            extraInfo.push(
              `default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`
            );
          }
        }
        if (option.presetArg !== void 0 && option.optional) {
          extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
        }
        if (option.envVar !== void 0) {
          extraInfo.push(`env: ${option.envVar}`);
        }
        if (extraInfo.length > 0) {
          const extraDescription = `(${extraInfo.join(", ")})`;
          if (option.description) {
            return `${option.description} ${extraDescription}`;
          }
          return extraDescription;
        }
        return option.description;
      }
      /**
       * Get the argument description to show in the list of arguments.
       *
       * @param {Argument} argument
       * @return {string}
       */
      argumentDescription(argument) {
        const extraInfo = [];
        if (argument.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (argument.defaultValue !== void 0) {
          extraInfo.push(
            `default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`
          );
        }
        if (extraInfo.length > 0) {
          const extraDescription = `(${extraInfo.join(", ")})`;
          if (argument.description) {
            return `${argument.description} ${extraDescription}`;
          }
          return extraDescription;
        }
        return argument.description;
      }
      /**
       * Format a list of items, given a heading and an array of formatted items.
       *
       * @param {string} heading
       * @param {string[]} items
       * @param {Help} helper
       * @returns string[]
       */
      formatItemList(heading, items, helper) {
        if (items.length === 0) return [];
        return [helper.styleTitle(heading), ...items, ""];
      }
      /**
       * Group items by their help group heading.
       *
       * @param {Command[] | Option[]} unsortedItems
       * @param {Command[] | Option[]} visibleItems
       * @param {Function} getGroup
       * @returns {Map<string, Command[] | Option[]>}
       */
      groupItems(unsortedItems, visibleItems, getGroup) {
        const result = /* @__PURE__ */ new Map();
        unsortedItems.forEach((item) => {
          const group = getGroup(item);
          if (!result.has(group)) result.set(group, []);
        });
        visibleItems.forEach((item) => {
          const group = getGroup(item);
          if (!result.has(group)) {
            result.set(group, []);
          }
          result.get(group).push(item);
        });
        return result;
      }
      /**
       * Generate the built-in help text.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {string}
       */
      formatHelp(cmd, helper) {
        const termWidth = helper.padWidth(cmd, helper);
        const helpWidth = helper.helpWidth ?? 80;
        function callFormatItem(term, description) {
          return helper.formatItem(term, termWidth, description, helper);
        }
        let output = [
          `${helper.styleTitle("Usage:")} ${helper.styleUsage(helper.commandUsage(cmd))}`,
          ""
        ];
        const commandDescription = helper.commandDescription(cmd);
        if (commandDescription.length > 0) {
          output = output.concat([
            helper.boxWrap(
              helper.styleCommandDescription(commandDescription),
              helpWidth
            ),
            ""
          ]);
        }
        const argumentList = helper.visibleArguments(cmd).map((argument) => {
          return callFormatItem(
            helper.styleArgumentTerm(helper.argumentTerm(argument)),
            helper.styleArgumentDescription(helper.argumentDescription(argument))
          );
        });
        output = output.concat(
          this.formatItemList("Arguments:", argumentList, helper)
        );
        const optionGroups = this.groupItems(
          cmd.options,
          helper.visibleOptions(cmd),
          (option) => option.helpGroupHeading ?? "Options:"
        );
        optionGroups.forEach((options, group) => {
          const optionList = options.map((option) => {
            return callFormatItem(
              helper.styleOptionTerm(helper.optionTerm(option)),
              helper.styleOptionDescription(helper.optionDescription(option))
            );
          });
          output = output.concat(this.formatItemList(group, optionList, helper));
        });
        if (helper.showGlobalOptions) {
          const globalOptionList = helper.visibleGlobalOptions(cmd).map((option) => {
            return callFormatItem(
              helper.styleOptionTerm(helper.optionTerm(option)),
              helper.styleOptionDescription(helper.optionDescription(option))
            );
          });
          output = output.concat(
            this.formatItemList("Global Options:", globalOptionList, helper)
          );
        }
        const commandGroups = this.groupItems(
          cmd.commands,
          helper.visibleCommands(cmd),
          (sub) => sub.helpGroup() || "Commands:"
        );
        commandGroups.forEach((commands, group) => {
          const commandList = commands.map((sub) => {
            return callFormatItem(
              helper.styleSubcommandTerm(helper.subcommandTerm(sub)),
              helper.styleSubcommandDescription(helper.subcommandDescription(sub))
            );
          });
          output = output.concat(this.formatItemList(group, commandList, helper));
        });
        return output.join("\n");
      }
      /**
       * Return display width of string, ignoring ANSI escape sequences. Used in padding and wrapping calculations.
       *
       * @param {string} str
       * @returns {number}
       */
      displayWidth(str) {
        return stripColor(str).length;
      }
      /**
       * Style the title for displaying in the help. Called with 'Usage:', 'Options:', etc.
       *
       * @param {string} str
       * @returns {string}
       */
      styleTitle(str) {
        return str;
      }
      styleUsage(str) {
        return str.split(" ").map((word) => {
          if (word === "[options]") return this.styleOptionText(word);
          if (word === "[command]") return this.styleSubcommandText(word);
          if (word[0] === "[" || word[0] === "<")
            return this.styleArgumentText(word);
          return this.styleCommandText(word);
        }).join(" ");
      }
      styleCommandDescription(str) {
        return this.styleDescriptionText(str);
      }
      styleOptionDescription(str) {
        return this.styleDescriptionText(str);
      }
      styleSubcommandDescription(str) {
        return this.styleDescriptionText(str);
      }
      styleArgumentDescription(str) {
        return this.styleDescriptionText(str);
      }
      styleDescriptionText(str) {
        return str;
      }
      styleOptionTerm(str) {
        return this.styleOptionText(str);
      }
      styleSubcommandTerm(str) {
        return str.split(" ").map((word) => {
          if (word === "[options]") return this.styleOptionText(word);
          if (word[0] === "[" || word[0] === "<")
            return this.styleArgumentText(word);
          return this.styleSubcommandText(word);
        }).join(" ");
      }
      styleArgumentTerm(str) {
        return this.styleArgumentText(str);
      }
      styleOptionText(str) {
        return str;
      }
      styleArgumentText(str) {
        return str;
      }
      styleSubcommandText(str) {
        return str;
      }
      styleCommandText(str) {
        return str;
      }
      /**
       * Calculate the pad width from the maximum term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      padWidth(cmd, helper) {
        return Math.max(
          helper.longestOptionTermLength(cmd, helper),
          helper.longestGlobalOptionTermLength(cmd, helper),
          helper.longestSubcommandTermLength(cmd, helper),
          helper.longestArgumentTermLength(cmd, helper)
        );
      }
      /**
       * Detect manually wrapped and indented strings by checking for line break followed by whitespace.
       *
       * @param {string} str
       * @returns {boolean}
       */
      preformatted(str) {
        return /\n[^\S\r\n]/.test(str);
      }
      /**
       * Format the "item", which consists of a term and description. Pad the term and wrap the description, indenting the following lines.
       *
       * So "TTT", 5, "DDD DDDD DD DDD" might be formatted for this.helpWidth=17 like so:
       *   TTT  DDD DDDD
       *        DD DDD
       *
       * @param {string} term
       * @param {number} termWidth
       * @param {string} description
       * @param {Help} helper
       * @returns {string}
       */
      formatItem(term, termWidth, description, helper) {
        const itemIndent = 2;
        const itemIndentStr = " ".repeat(itemIndent);
        if (!description) return itemIndentStr + term;
        const paddedTerm = term.padEnd(
          termWidth + term.length - helper.displayWidth(term)
        );
        const spacerWidth = 2;
        const helpWidth = this.helpWidth ?? 80;
        const remainingWidth = helpWidth - termWidth - spacerWidth - itemIndent;
        let formattedDescription;
        if (remainingWidth < this.minWidthToWrap || helper.preformatted(description)) {
          formattedDescription = description;
        } else {
          const wrappedDescription = helper.boxWrap(description, remainingWidth);
          formattedDescription = wrappedDescription.replace(
            /\n/g,
            "\n" + " ".repeat(termWidth + spacerWidth)
          );
        }
        return itemIndentStr + paddedTerm + " ".repeat(spacerWidth) + formattedDescription.replace(/\n/g, `
${itemIndentStr}`);
      }
      /**
       * Wrap a string at whitespace, preserving existing line breaks.
       * Wrapping is skipped if the width is less than `minWidthToWrap`.
       *
       * @param {string} str
       * @param {number} width
       * @returns {string}
       */
      boxWrap(str, width4) {
        if (width4 < this.minWidthToWrap) return str;
        const rawLines = str.split(/\r\n|\n/);
        const chunkPattern = /[\s]*[^\s]+/g;
        const wrappedLines = [];
        rawLines.forEach((line) => {
          const chunks = line.match(chunkPattern);
          if (chunks === null) {
            wrappedLines.push("");
            return;
          }
          let sumChunks = [chunks.shift()];
          let sumWidth = this.displayWidth(sumChunks[0]);
          chunks.forEach((chunk) => {
            const visibleWidth = this.displayWidth(chunk);
            if (sumWidth + visibleWidth <= width4) {
              sumChunks.push(chunk);
              sumWidth += visibleWidth;
              return;
            }
            wrappedLines.push(sumChunks.join(""));
            const nextChunk = chunk.trimStart();
            sumChunks = [nextChunk];
            sumWidth = this.displayWidth(nextChunk);
          });
          wrappedLines.push(sumChunks.join(""));
        });
        return wrappedLines.join("\n");
      }
    };
    function stripColor(str) {
      const sgrPattern = /\x1b\[\d*(;\d*)*m/g;
      return str.replace(sgrPattern, "");
    }
    exports.Help = Help2;
    exports.stripColor = stripColor;
  }
});

// node_modules/.pnpm/commander@14.0.3/node_modules/commander/lib/option.js
var require_option = __commonJS({
  "node_modules/.pnpm/commander@14.0.3/node_modules/commander/lib/option.js"(exports) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Option2 = class {
      /**
       * Initialize a new `Option` with the given `flags` and `description`.
       *
       * @param {string} flags
       * @param {string} [description]
       */
      constructor(flags, description) {
        this.flags = flags;
        this.description = description || "";
        this.required = flags.includes("<");
        this.optional = flags.includes("[");
        this.variadic = /\w\.\.\.[>\]]$/.test(flags);
        this.mandatory = false;
        const optionFlags = splitOptionFlags(flags);
        this.short = optionFlags.shortFlag;
        this.long = optionFlags.longFlag;
        this.negate = false;
        if (this.long) {
          this.negate = this.long.startsWith("--no-");
        }
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.presetArg = void 0;
        this.envVar = void 0;
        this.parseArg = void 0;
        this.hidden = false;
        this.argChoices = void 0;
        this.conflictsWith = [];
        this.implied = void 0;
        this.helpGroupHeading = void 0;
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {*} value
       * @param {string} [description]
       * @return {Option}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Preset to use when option used without option-argument, especially optional but also boolean and negated.
       * The custom processing (parseArg) is called.
       *
       * @example
       * new Option('--color').default('GREYSCALE').preset('RGB');
       * new Option('--donate [amount]').preset('20').argParser(parseFloat);
       *
       * @param {*} arg
       * @return {Option}
       */
      preset(arg) {
        this.presetArg = arg;
        return this;
      }
      /**
       * Add option name(s) that conflict with this option.
       * An error will be displayed if conflicting options are found during parsing.
       *
       * @example
       * new Option('--rgb').conflicts('cmyk');
       * new Option('--js').conflicts(['ts', 'jsx']);
       *
       * @param {(string | string[])} names
       * @return {Option}
       */
      conflicts(names) {
        this.conflictsWith = this.conflictsWith.concat(names);
        return this;
      }
      /**
       * Specify implied option values for when this option is set and the implied options are not.
       *
       * The custom processing (parseArg) is not called on the implied values.
       *
       * @example
       * program
       *   .addOption(new Option('--log', 'write logging information to file'))
       *   .addOption(new Option('--trace', 'log extra details').implies({ log: 'trace.txt' }));
       *
       * @param {object} impliedOptionValues
       * @return {Option}
       */
      implies(impliedOptionValues) {
        let newImplied = impliedOptionValues;
        if (typeof impliedOptionValues === "string") {
          newImplied = { [impliedOptionValues]: true };
        }
        this.implied = Object.assign(this.implied || {}, newImplied);
        return this;
      }
      /**
       * Set environment variable to check for option value.
       *
       * An environment variable is only used if when processed the current option value is
       * undefined, or the source of the current value is 'default' or 'config' or 'env'.
       *
       * @param {string} name
       * @return {Option}
       */
      env(name) {
        this.envVar = name;
        return this;
      }
      /**
       * Set the custom handler for processing CLI option arguments into option values.
       *
       * @param {Function} [fn]
       * @return {Option}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Whether the option is mandatory and must have a value after parsing.
       *
       * @param {boolean} [mandatory=true]
       * @return {Option}
       */
      makeOptionMandatory(mandatory = true) {
        this.mandatory = !!mandatory;
        return this;
      }
      /**
       * Hide option in help.
       *
       * @param {boolean} [hide=true]
       * @return {Option}
       */
      hideHelp(hide = true) {
        this.hidden = !!hide;
        return this;
      }
      /**
       * @package
       */
      _collectValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        previous.push(value);
        return previous;
      }
      /**
       * Only allow option value to be one of choices.
       *
       * @param {string[]} values
       * @return {Option}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(
              `Allowed choices are ${this.argChoices.join(", ")}.`
            );
          }
          if (this.variadic) {
            return this._collectValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Return option name.
       *
       * @return {string}
       */
      name() {
        if (this.long) {
          return this.long.replace(/^--/, "");
        }
        return this.short.replace(/^-/, "");
      }
      /**
       * Return option name, in a camelcase format that can be used
       * as an object attribute key.
       *
       * @return {string}
       */
      attributeName() {
        if (this.negate) {
          return camelcase(this.name().replace(/^no-/, ""));
        }
        return camelcase(this.name());
      }
      /**
       * Set the help group heading.
       *
       * @param {string} heading
       * @return {Option}
       */
      helpGroup(heading) {
        this.helpGroupHeading = heading;
        return this;
      }
      /**
       * Check if `arg` matches the short or long flag.
       *
       * @param {string} arg
       * @return {boolean}
       * @package
       */
      is(arg) {
        return this.short === arg || this.long === arg;
      }
      /**
       * Return whether a boolean option.
       *
       * Options are one of boolean, negated, required argument, or optional argument.
       *
       * @return {boolean}
       * @package
       */
      isBoolean() {
        return !this.required && !this.optional && !this.negate;
      }
    };
    var DualOptions = class {
      /**
       * @param {Option[]} options
       */
      constructor(options) {
        this.positiveOptions = /* @__PURE__ */ new Map();
        this.negativeOptions = /* @__PURE__ */ new Map();
        this.dualOptions = /* @__PURE__ */ new Set();
        options.forEach((option) => {
          if (option.negate) {
            this.negativeOptions.set(option.attributeName(), option);
          } else {
            this.positiveOptions.set(option.attributeName(), option);
          }
        });
        this.negativeOptions.forEach((value, key) => {
          if (this.positiveOptions.has(key)) {
            this.dualOptions.add(key);
          }
        });
      }
      /**
       * Did the value come from the option, and not from possible matching dual option?
       *
       * @param {*} value
       * @param {Option} option
       * @returns {boolean}
       */
      valueFromOption(value, option) {
        const optionKey = option.attributeName();
        if (!this.dualOptions.has(optionKey)) return true;
        const preset = this.negativeOptions.get(optionKey).presetArg;
        const negativeValue = preset !== void 0 ? preset : false;
        return option.negate === (negativeValue === value);
      }
    };
    function camelcase(str) {
      return str.split("-").reduce((str2, word) => {
        return str2 + word[0].toUpperCase() + word.slice(1);
      });
    }
    function splitOptionFlags(flags) {
      let shortFlag;
      let longFlag;
      const shortFlagExp = /^-[^-]$/;
      const longFlagExp = /^--[^-]/;
      const flagParts = flags.split(/[ |,]+/).concat("guard");
      if (shortFlagExp.test(flagParts[0])) shortFlag = flagParts.shift();
      if (longFlagExp.test(flagParts[0])) longFlag = flagParts.shift();
      if (!shortFlag && shortFlagExp.test(flagParts[0]))
        shortFlag = flagParts.shift();
      if (!shortFlag && longFlagExp.test(flagParts[0])) {
        shortFlag = longFlag;
        longFlag = flagParts.shift();
      }
      if (flagParts[0].startsWith("-")) {
        const unsupportedFlag = flagParts[0];
        const baseError = `option creation failed due to '${unsupportedFlag}' in option flags '${flags}'`;
        if (/^-[^-][^-]/.test(unsupportedFlag))
          throw new Error(
            `${baseError}
- a short flag is a single dash and a single character
  - either use a single dash and a single character (for a short flag)
  - or use a double dash for a long option (and can have two, like '--ws, --workspace')`
          );
        if (shortFlagExp.test(unsupportedFlag))
          throw new Error(`${baseError}
- too many short flags`);
        if (longFlagExp.test(unsupportedFlag))
          throw new Error(`${baseError}
- too many long flags`);
        throw new Error(`${baseError}
- unrecognised flag format`);
      }
      if (shortFlag === void 0 && longFlag === void 0)
        throw new Error(
          `option creation failed due to no flags found in '${flags}'.`
        );
      return { shortFlag, longFlag };
    }
    exports.Option = Option2;
    exports.DualOptions = DualOptions;
  }
});

// node_modules/.pnpm/commander@14.0.3/node_modules/commander/lib/suggestSimilar.js
var require_suggestSimilar = __commonJS({
  "node_modules/.pnpm/commander@14.0.3/node_modules/commander/lib/suggestSimilar.js"(exports) {
    var maxDistance = 3;
    function editDistance(a, b) {
      if (Math.abs(a.length - b.length) > maxDistance)
        return Math.max(a.length, b.length);
      const d = [];
      for (let i = 0; i <= a.length; i++) {
        d[i] = [i];
      }
      for (let j = 0; j <= b.length; j++) {
        d[0][j] = j;
      }
      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          let cost = 1;
          if (a[i - 1] === b[j - 1]) {
            cost = 0;
          } else {
            cost = 1;
          }
          d[i][j] = Math.min(
            d[i - 1][j] + 1,
            // deletion
            d[i][j - 1] + 1,
            // insertion
            d[i - 1][j - 1] + cost
            // substitution
          );
          if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
            d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
          }
        }
      }
      return d[a.length][b.length];
    }
    function suggestSimilar(word, candidates) {
      if (!candidates || candidates.length === 0) return "";
      candidates = Array.from(new Set(candidates));
      const searchingOptions = word.startsWith("--");
      if (searchingOptions) {
        word = word.slice(2);
        candidates = candidates.map((candidate) => candidate.slice(2));
      }
      let similar = [];
      let bestDistance = maxDistance;
      const minSimilarity = 0.4;
      candidates.forEach((candidate) => {
        if (candidate.length <= 1) return;
        const distance = editDistance(word, candidate);
        const length = Math.max(word.length, candidate.length);
        const similarity = (length - distance) / length;
        if (similarity > minSimilarity) {
          if (distance < bestDistance) {
            bestDistance = distance;
            similar = [candidate];
          } else if (distance === bestDistance) {
            similar.push(candidate);
          }
        }
      });
      similar.sort((a, b) => a.localeCompare(b));
      if (searchingOptions) {
        similar = similar.map((candidate) => `--${candidate}`);
      }
      if (similar.length > 1) {
        return `
(Did you mean one of ${similar.join(", ")}?)`;
      }
      if (similar.length === 1) {
        return `
(Did you mean ${similar[0]}?)`;
      }
      return "";
    }
    exports.suggestSimilar = suggestSimilar;
  }
});

// node_modules/.pnpm/commander@14.0.3/node_modules/commander/lib/command.js
var require_command = __commonJS({
  "node_modules/.pnpm/commander@14.0.3/node_modules/commander/lib/command.js"(exports) {
    var EventEmitter = __require("node:events").EventEmitter;
    var childProcess = __require("node:child_process");
    var path = __require("node:path");
    var fs = __require("node:fs");
    var process2 = __require("node:process");
    var { Argument: Argument2, humanReadableArgName } = require_argument();
    var { CommanderError: CommanderError2 } = require_error();
    var { Help: Help2, stripColor } = require_help();
    var { Option: Option2, DualOptions } = require_option();
    var { suggestSimilar } = require_suggestSimilar();
    var Command2 = class _Command extends EventEmitter {
      /**
       * Initialize a new `Command`.
       *
       * @param {string} [name]
       */
      constructor(name) {
        super();
        this.commands = [];
        this.options = [];
        this.parent = null;
        this._allowUnknownOption = false;
        this._allowExcessArguments = false;
        this.registeredArguments = [];
        this._args = this.registeredArguments;
        this.args = [];
        this.rawArgs = [];
        this.processedArgs = [];
        this._scriptPath = null;
        this._name = name || "";
        this._optionValues = {};
        this._optionValueSources = {};
        this._storeOptionsAsProperties = false;
        this._actionHandler = null;
        this._executableHandler = false;
        this._executableFile = null;
        this._executableDir = null;
        this._defaultCommandName = null;
        this._exitCallback = null;
        this._aliases = [];
        this._combineFlagAndOptionalValue = true;
        this._description = "";
        this._summary = "";
        this._argsDescription = void 0;
        this._enablePositionalOptions = false;
        this._passThroughOptions = false;
        this._lifeCycleHooks = {};
        this._showHelpAfterError = false;
        this._showSuggestionAfterError = true;
        this._savedState = null;
        this._outputConfiguration = {
          writeOut: (str) => process2.stdout.write(str),
          writeErr: (str) => process2.stderr.write(str),
          outputError: (str, write) => write(str),
          getOutHelpWidth: () => process2.stdout.isTTY ? process2.stdout.columns : void 0,
          getErrHelpWidth: () => process2.stderr.isTTY ? process2.stderr.columns : void 0,
          getOutHasColors: () => useColor() ?? (process2.stdout.isTTY && process2.stdout.hasColors?.()),
          getErrHasColors: () => useColor() ?? (process2.stderr.isTTY && process2.stderr.hasColors?.()),
          stripColor: (str) => stripColor(str)
        };
        this._hidden = false;
        this._helpOption = void 0;
        this._addImplicitHelpCommand = void 0;
        this._helpCommand = void 0;
        this._helpConfiguration = {};
        this._helpGroupHeading = void 0;
        this._defaultCommandGroup = void 0;
        this._defaultOptionGroup = void 0;
      }
      /**
       * Copy settings that are useful to have in common across root command and subcommands.
       *
       * (Used internally when adding a command using `.command()` so subcommands inherit parent settings.)
       *
       * @param {Command} sourceCommand
       * @return {Command} `this` command for chaining
       */
      copyInheritedSettings(sourceCommand) {
        this._outputConfiguration = sourceCommand._outputConfiguration;
        this._helpOption = sourceCommand._helpOption;
        this._helpCommand = sourceCommand._helpCommand;
        this._helpConfiguration = sourceCommand._helpConfiguration;
        this._exitCallback = sourceCommand._exitCallback;
        this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
        this._combineFlagAndOptionalValue = sourceCommand._combineFlagAndOptionalValue;
        this._allowExcessArguments = sourceCommand._allowExcessArguments;
        this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
        this._showHelpAfterError = sourceCommand._showHelpAfterError;
        this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;
        return this;
      }
      /**
       * @returns {Command[]}
       * @private
       */
      _getCommandAndAncestors() {
        const result = [];
        for (let command = this; command; command = command.parent) {
          result.push(command);
        }
        return result;
      }
      /**
       * Define a command.
       *
       * There are two styles of command: pay attention to where to put the description.
       *
       * @example
       * // Command implemented using action handler (description is supplied separately to `.command`)
       * program
       *   .command('clone <source> [destination]')
       *   .description('clone a repository into a newly created directory')
       *   .action((source, destination) => {
       *     console.log('clone command called');
       *   });
       *
       * // Command implemented using separate executable file (description is second parameter to `.command`)
       * program
       *   .command('start <service>', 'start named service')
       *   .command('stop [service]', 'stop named service, or all if no name supplied');
       *
       * @param {string} nameAndArgs - command name and arguments, args are `<required>` or `[optional]` and last may also be `variadic...`
       * @param {(object | string)} [actionOptsOrExecDesc] - configuration options (for action), or description (for executable)
       * @param {object} [execOpts] - configuration options (for executable)
       * @return {Command} returns new command for action handler, or `this` for executable command
       */
      command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
        let desc = actionOptsOrExecDesc;
        let opts = execOpts;
        if (typeof desc === "object" && desc !== null) {
          opts = desc;
          desc = null;
        }
        opts = opts || {};
        const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/);
        const cmd = this.createCommand(name);
        if (desc) {
          cmd.description(desc);
          cmd._executableHandler = true;
        }
        if (opts.isDefault) this._defaultCommandName = cmd._name;
        cmd._hidden = !!(opts.noHelp || opts.hidden);
        cmd._executableFile = opts.executableFile || null;
        if (args) cmd.arguments(args);
        this._registerCommand(cmd);
        cmd.parent = this;
        cmd.copyInheritedSettings(this);
        if (desc) return this;
        return cmd;
      }
      /**
       * Factory routine to create a new unattached command.
       *
       * See .command() for creating an attached subcommand, which uses this routine to
       * create the command. You can override createCommand to customise subcommands.
       *
       * @param {string} [name]
       * @return {Command} new command
       */
      createCommand(name) {
        return new _Command(name);
      }
      /**
       * You can customise the help with a subclass of Help by overriding createHelp,
       * or by overriding Help properties using configureHelp().
       *
       * @return {Help}
       */
      createHelp() {
        return Object.assign(new Help2(), this.configureHelp());
      }
      /**
       * You can customise the help by overriding Help properties using configureHelp(),
       * or with a subclass of Help by overriding createHelp().
       *
       * @param {object} [configuration] - configuration options
       * @return {(Command | object)} `this` command for chaining, or stored configuration
       */
      configureHelp(configuration) {
        if (configuration === void 0) return this._helpConfiguration;
        this._helpConfiguration = configuration;
        return this;
      }
      /**
       * The default output goes to stdout and stderr. You can customise this for special
       * applications. You can also customise the display of errors by overriding outputError.
       *
       * The configuration properties are all functions:
       *
       *     // change how output being written, defaults to stdout and stderr
       *     writeOut(str)
       *     writeErr(str)
       *     // change how output being written for errors, defaults to writeErr
       *     outputError(str, write) // used for displaying errors and not used for displaying help
       *     // specify width for wrapping help
       *     getOutHelpWidth()
       *     getErrHelpWidth()
       *     // color support, currently only used with Help
       *     getOutHasColors()
       *     getErrHasColors()
       *     stripColor() // used to remove ANSI escape codes if output does not have colors
       *
       * @param {object} [configuration] - configuration options
       * @return {(Command | object)} `this` command for chaining, or stored configuration
       */
      configureOutput(configuration) {
        if (configuration === void 0) return this._outputConfiguration;
        this._outputConfiguration = {
          ...this._outputConfiguration,
          ...configuration
        };
        return this;
      }
      /**
       * Display the help or a custom message after an error occurs.
       *
       * @param {(boolean|string)} [displayHelp]
       * @return {Command} `this` command for chaining
       */
      showHelpAfterError(displayHelp = true) {
        if (typeof displayHelp !== "string") displayHelp = !!displayHelp;
        this._showHelpAfterError = displayHelp;
        return this;
      }
      /**
       * Display suggestion of similar commands for unknown commands, or options for unknown options.
       *
       * @param {boolean} [displaySuggestion]
       * @return {Command} `this` command for chaining
       */
      showSuggestionAfterError(displaySuggestion = true) {
        this._showSuggestionAfterError = !!displaySuggestion;
        return this;
      }
      /**
       * Add a prepared subcommand.
       *
       * See .command() for creating an attached subcommand which inherits settings from its parent.
       *
       * @param {Command} cmd - new subcommand
       * @param {object} [opts] - configuration options
       * @return {Command} `this` command for chaining
       */
      addCommand(cmd, opts) {
        if (!cmd._name) {
          throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
        }
        opts = opts || {};
        if (opts.isDefault) this._defaultCommandName = cmd._name;
        if (opts.noHelp || opts.hidden) cmd._hidden = true;
        this._registerCommand(cmd);
        cmd.parent = this;
        cmd._checkForBrokenPassThrough();
        return this;
      }
      /**
       * Factory routine to create a new unattached argument.
       *
       * See .argument() for creating an attached argument, which uses this routine to
       * create the argument. You can override createArgument to return a custom argument.
       *
       * @param {string} name
       * @param {string} [description]
       * @return {Argument} new argument
       */
      createArgument(name, description) {
        return new Argument2(name, description);
      }
      /**
       * Define argument syntax for command.
       *
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @example
       * program.argument('<input-file>');
       * program.argument('[output-file]');
       *
       * @param {string} name
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom argument processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      argument(name, description, parseArg, defaultValue) {
        const argument = this.createArgument(name, description);
        if (typeof parseArg === "function") {
          argument.default(defaultValue).argParser(parseArg);
        } else {
          argument.default(parseArg);
        }
        this.addArgument(argument);
        return this;
      }
      /**
       * Define argument syntax for command, adding multiple at once (without descriptions).
       *
       * See also .argument().
       *
       * @example
       * program.arguments('<cmd> [env]');
       *
       * @param {string} names
       * @return {Command} `this` command for chaining
       */
      arguments(names) {
        names.trim().split(/ +/).forEach((detail) => {
          this.argument(detail);
        });
        return this;
      }
      /**
       * Define argument syntax for command, adding a prepared argument.
       *
       * @param {Argument} argument
       * @return {Command} `this` command for chaining
       */
      addArgument(argument) {
        const previousArgument = this.registeredArguments.slice(-1)[0];
        if (previousArgument?.variadic) {
          throw new Error(
            `only the last argument can be variadic '${previousArgument.name()}'`
          );
        }
        if (argument.required && argument.defaultValue !== void 0 && argument.parseArg === void 0) {
          throw new Error(
            `a default value for a required argument is never used: '${argument.name()}'`
          );
        }
        this.registeredArguments.push(argument);
        return this;
      }
      /**
       * Customise or override default help command. By default a help command is automatically added if your command has subcommands.
       *
       * @example
       *    program.helpCommand('help [cmd]');
       *    program.helpCommand('help [cmd]', 'show help');
       *    program.helpCommand(false); // suppress default help command
       *    program.helpCommand(true); // add help command even if no subcommands
       *
       * @param {string|boolean} enableOrNameAndArgs - enable with custom name and/or arguments, or boolean to override whether added
       * @param {string} [description] - custom description
       * @return {Command} `this` command for chaining
       */
      helpCommand(enableOrNameAndArgs, description) {
        if (typeof enableOrNameAndArgs === "boolean") {
          this._addImplicitHelpCommand = enableOrNameAndArgs;
          if (enableOrNameAndArgs && this._defaultCommandGroup) {
            this._initCommandGroup(this._getHelpCommand());
          }
          return this;
        }
        const nameAndArgs = enableOrNameAndArgs ?? "help [command]";
        const [, helpName, helpArgs] = nameAndArgs.match(/([^ ]+) *(.*)/);
        const helpDescription = description ?? "display help for command";
        const helpCommand = this.createCommand(helpName);
        helpCommand.helpOption(false);
        if (helpArgs) helpCommand.arguments(helpArgs);
        if (helpDescription) helpCommand.description(helpDescription);
        this._addImplicitHelpCommand = true;
        this._helpCommand = helpCommand;
        if (enableOrNameAndArgs || description) this._initCommandGroup(helpCommand);
        return this;
      }
      /**
       * Add prepared custom help command.
       *
       * @param {(Command|string|boolean)} helpCommand - custom help command, or deprecated enableOrNameAndArgs as for `.helpCommand()`
       * @param {string} [deprecatedDescription] - deprecated custom description used with custom name only
       * @return {Command} `this` command for chaining
       */
      addHelpCommand(helpCommand, deprecatedDescription) {
        if (typeof helpCommand !== "object") {
          this.helpCommand(helpCommand, deprecatedDescription);
          return this;
        }
        this._addImplicitHelpCommand = true;
        this._helpCommand = helpCommand;
        this._initCommandGroup(helpCommand);
        return this;
      }
      /**
       * Lazy create help command.
       *
       * @return {(Command|null)}
       * @package
       */
      _getHelpCommand() {
        const hasImplicitHelpCommand = this._addImplicitHelpCommand ?? (this.commands.length && !this._actionHandler && !this._findCommand("help"));
        if (hasImplicitHelpCommand) {
          if (this._helpCommand === void 0) {
            this.helpCommand(void 0, void 0);
          }
          return this._helpCommand;
        }
        return null;
      }
      /**
       * Add hook for life cycle event.
       *
       * @param {string} event
       * @param {Function} listener
       * @return {Command} `this` command for chaining
       */
      hook(event, listener) {
        const allowedValues = ["preSubcommand", "preAction", "postAction"];
        if (!allowedValues.includes(event)) {
          throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        if (this._lifeCycleHooks[event]) {
          this._lifeCycleHooks[event].push(listener);
        } else {
          this._lifeCycleHooks[event] = [listener];
        }
        return this;
      }
      /**
       * Register callback to use as replacement for calling process.exit.
       *
       * @param {Function} [fn] optional callback which will be passed a CommanderError, defaults to throwing
       * @return {Command} `this` command for chaining
       */
      exitOverride(fn) {
        if (fn) {
          this._exitCallback = fn;
        } else {
          this._exitCallback = (err) => {
            if (err.code !== "commander.executeSubCommandAsync") {
              throw err;
            } else {
            }
          };
        }
        return this;
      }
      /**
       * Call process.exit, and _exitCallback if defined.
       *
       * @param {number} exitCode exit code for using with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       * @return never
       * @private
       */
      _exit(exitCode, code, message) {
        if (this._exitCallback) {
          this._exitCallback(new CommanderError2(exitCode, code, message));
        }
        process2.exit(exitCode);
      }
      /**
       * Register callback `fn` for the command.
       *
       * @example
       * program
       *   .command('serve')
       *   .description('start service')
       *   .action(function() {
       *      // do work here
       *   });
       *
       * @param {Function} fn
       * @return {Command} `this` command for chaining
       */
      action(fn) {
        const listener = (args) => {
          const expectedArgsCount = this.registeredArguments.length;
          const actionArgs = args.slice(0, expectedArgsCount);
          if (this._storeOptionsAsProperties) {
            actionArgs[expectedArgsCount] = this;
          } else {
            actionArgs[expectedArgsCount] = this.opts();
          }
          actionArgs.push(this);
          return fn.apply(this, actionArgs);
        };
        this._actionHandler = listener;
        return this;
      }
      /**
       * Factory routine to create a new unattached option.
       *
       * See .option() for creating an attached option, which uses this routine to
       * create the option. You can override createOption to return a custom option.
       *
       * @param {string} flags
       * @param {string} [description]
       * @return {Option} new option
       */
      createOption(flags, description) {
        return new Option2(flags, description);
      }
      /**
       * Wrap parseArgs to catch 'commander.invalidArgument'.
       *
       * @param {(Option | Argument)} target
       * @param {string} value
       * @param {*} previous
       * @param {string} invalidArgumentMessage
       * @private
       */
      _callParseArg(target, value, previous, invalidArgumentMessage) {
        try {
          return target.parseArg(value, previous);
        } catch (err) {
          if (err.code === "commander.invalidArgument") {
            const message = `${invalidArgumentMessage} ${err.message}`;
            this.error(message, { exitCode: err.exitCode, code: err.code });
          }
          throw err;
        }
      }
      /**
       * Check for option flag conflicts.
       * Register option if no conflicts found, or throw on conflict.
       *
       * @param {Option} option
       * @private
       */
      _registerOption(option) {
        const matchingOption = option.short && this._findOption(option.short) || option.long && this._findOption(option.long);
        if (matchingOption) {
          const matchingFlag = option.long && this._findOption(option.long) ? option.long : option.short;
          throw new Error(`Cannot add option '${option.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${matchingFlag}'
-  already used by option '${matchingOption.flags}'`);
        }
        this._initOptionGroup(option);
        this.options.push(option);
      }
      /**
       * Check for command name and alias conflicts with existing commands.
       * Register command if no conflicts found, or throw on conflict.
       *
       * @param {Command} command
       * @private
       */
      _registerCommand(command) {
        const knownBy = (cmd) => {
          return [cmd.name()].concat(cmd.aliases());
        };
        const alreadyUsed = knownBy(command).find(
          (name) => this._findCommand(name)
        );
        if (alreadyUsed) {
          const existingCmd = knownBy(this._findCommand(alreadyUsed)).join("|");
          const newCmd = knownBy(command).join("|");
          throw new Error(
            `cannot add command '${newCmd}' as already have command '${existingCmd}'`
          );
        }
        this._initCommandGroup(command);
        this.commands.push(command);
      }
      /**
       * Add an option.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addOption(option) {
        this._registerOption(option);
        const oname = option.name();
        const name = option.attributeName();
        if (option.negate) {
          const positiveLongFlag = option.long.replace(/^--no-/, "--");
          if (!this._findOption(positiveLongFlag)) {
            this.setOptionValueWithSource(
              name,
              option.defaultValue === void 0 ? true : option.defaultValue,
              "default"
            );
          }
        } else if (option.defaultValue !== void 0) {
          this.setOptionValueWithSource(name, option.defaultValue, "default");
        }
        const handleOptionValue = (val, invalidValueMessage, valueSource) => {
          if (val == null && option.presetArg !== void 0) {
            val = option.presetArg;
          }
          const oldValue = this.getOptionValue(name);
          if (val !== null && option.parseArg) {
            val = this._callParseArg(option, val, oldValue, invalidValueMessage);
          } else if (val !== null && option.variadic) {
            val = option._collectValue(val, oldValue);
          }
          if (val == null) {
            if (option.negate) {
              val = false;
            } else if (option.isBoolean() || option.optional) {
              val = true;
            } else {
              val = "";
            }
          }
          this.setOptionValueWithSource(name, val, valueSource);
        };
        this.on("option:" + oname, (val) => {
          const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
          handleOptionValue(val, invalidValueMessage, "cli");
        });
        if (option.envVar) {
          this.on("optionEnv:" + oname, (val) => {
            const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
            handleOptionValue(val, invalidValueMessage, "env");
          });
        }
        return this;
      }
      /**
       * Internal implementation shared by .option() and .requiredOption()
       *
       * @return {Command} `this` command for chaining
       * @private
       */
      _optionEx(config, flags, description, fn, defaultValue) {
        if (typeof flags === "object" && flags instanceof Option2) {
          throw new Error(
            "To add an Option object use addOption() instead of option() or requiredOption()"
          );
        }
        const option = this.createOption(flags, description);
        option.makeOptionMandatory(!!config.mandatory);
        if (typeof fn === "function") {
          option.default(defaultValue).argParser(fn);
        } else if (fn instanceof RegExp) {
          const regex = fn;
          fn = (val, def) => {
            const m = regex.exec(val);
            return m ? m[0] : def;
          };
          option.default(defaultValue).argParser(fn);
        } else {
          option.default(fn);
        }
        return this.addOption(option);
      }
      /**
       * Define option with `flags`, `description`, and optional argument parsing function or `defaultValue` or both.
       *
       * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space. A required
       * option-argument is indicated by `<>` and an optional option-argument by `[]`.
       *
       * See the README for more details, and see also addOption() and requiredOption().
       *
       * @example
       * program
       *     .option('-p, --pepper', 'add pepper')
       *     .option('--pt, --pizza-type <TYPE>', 'type of pizza') // required option-argument
       *     .option('-c, --cheese [CHEESE]', 'add extra cheese', 'mozzarella') // optional option-argument with default
       *     .option('-t, --tip <VALUE>', 'add tip to purchase cost', parseFloat) // custom parse function
       *
       * @param {string} flags
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom option processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      option(flags, description, parseArg, defaultValue) {
        return this._optionEx({}, flags, description, parseArg, defaultValue);
      }
      /**
       * Add a required option which must have a value after parsing. This usually means
       * the option must be specified on the command line. (Otherwise the same as .option().)
       *
       * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space.
       *
       * @param {string} flags
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom option processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      requiredOption(flags, description, parseArg, defaultValue) {
        return this._optionEx(
          { mandatory: true },
          flags,
          description,
          parseArg,
          defaultValue
        );
      }
      /**
       * Alter parsing of short flags with optional values.
       *
       * @example
       * // for `.option('-f,--flag [value]'):
       * program.combineFlagAndOptionalValue(true);  // `-f80` is treated like `--flag=80`, this is the default behaviour
       * program.combineFlagAndOptionalValue(false) // `-fb` is treated like `-f -b`
       *
       * @param {boolean} [combine] - if `true` or omitted, an optional value can be specified directly after the flag.
       * @return {Command} `this` command for chaining
       */
      combineFlagAndOptionalValue(combine = true) {
        this._combineFlagAndOptionalValue = !!combine;
        return this;
      }
      /**
       * Allow unknown options on the command line.
       *
       * @param {boolean} [allowUnknown] - if `true` or omitted, no error will be thrown for unknown options.
       * @return {Command} `this` command for chaining
       */
      allowUnknownOption(allowUnknown = true) {
        this._allowUnknownOption = !!allowUnknown;
        return this;
      }
      /**
       * Allow excess command-arguments on the command line. Pass false to make excess arguments an error.
       *
       * @param {boolean} [allowExcess] - if `true` or omitted, no error will be thrown for excess arguments.
       * @return {Command} `this` command for chaining
       */
      allowExcessArguments(allowExcess = true) {
        this._allowExcessArguments = !!allowExcess;
        return this;
      }
      /**
       * Enable positional options. Positional means global options are specified before subcommands which lets
       * subcommands reuse the same option names, and also enables subcommands to turn on passThroughOptions.
       * The default behaviour is non-positional and global options may appear anywhere on the command line.
       *
       * @param {boolean} [positional]
       * @return {Command} `this` command for chaining
       */
      enablePositionalOptions(positional = true) {
        this._enablePositionalOptions = !!positional;
        return this;
      }
      /**
       * Pass through options that come after command-arguments rather than treat them as command-options,
       * so actual command-options come before command-arguments. Turning this on for a subcommand requires
       * positional options to have been enabled on the program (parent commands).
       * The default behaviour is non-positional and options may appear before or after command-arguments.
       *
       * @param {boolean} [passThrough] for unknown options.
       * @return {Command} `this` command for chaining
       */
      passThroughOptions(passThrough = true) {
        this._passThroughOptions = !!passThrough;
        this._checkForBrokenPassThrough();
        return this;
      }
      /**
       * @private
       */
      _checkForBrokenPassThrough() {
        if (this.parent && this._passThroughOptions && !this.parent._enablePositionalOptions) {
          throw new Error(
            `passThroughOptions cannot be used for '${this._name}' without turning on enablePositionalOptions for parent command(s)`
          );
        }
      }
      /**
       * Whether to store option values as properties on command object,
       * or store separately (specify false). In both cases the option values can be accessed using .opts().
       *
       * @param {boolean} [storeAsProperties=true]
       * @return {Command} `this` command for chaining
       */
      storeOptionsAsProperties(storeAsProperties = true) {
        if (this.options.length) {
          throw new Error("call .storeOptionsAsProperties() before adding options");
        }
        if (Object.keys(this._optionValues).length) {
          throw new Error(
            "call .storeOptionsAsProperties() before setting option values"
          );
        }
        this._storeOptionsAsProperties = !!storeAsProperties;
        return this;
      }
      /**
       * Retrieve option value.
       *
       * @param {string} key
       * @return {object} value
       */
      getOptionValue(key) {
        if (this._storeOptionsAsProperties) {
          return this[key];
        }
        return this._optionValues[key];
      }
      /**
       * Store option value.
       *
       * @param {string} key
       * @param {object} value
       * @return {Command} `this` command for chaining
       */
      setOptionValue(key, value) {
        return this.setOptionValueWithSource(key, value, void 0);
      }
      /**
       * Store option value and where the value came from.
       *
       * @param {string} key
       * @param {object} value
       * @param {string} source - expected values are default/config/env/cli/implied
       * @return {Command} `this` command for chaining
       */
      setOptionValueWithSource(key, value, source) {
        if (this._storeOptionsAsProperties) {
          this[key] = value;
        } else {
          this._optionValues[key] = value;
        }
        this._optionValueSources[key] = source;
        return this;
      }
      /**
       * Get source of option value.
       * Expected values are default | config | env | cli | implied
       *
       * @param {string} key
       * @return {string}
       */
      getOptionValueSource(key) {
        return this._optionValueSources[key];
      }
      /**
       * Get source of option value. See also .optsWithGlobals().
       * Expected values are default | config | env | cli | implied
       *
       * @param {string} key
       * @return {string}
       */
      getOptionValueSourceWithGlobals(key) {
        let source;
        this._getCommandAndAncestors().forEach((cmd) => {
          if (cmd.getOptionValueSource(key) !== void 0) {
            source = cmd.getOptionValueSource(key);
          }
        });
        return source;
      }
      /**
       * Get user arguments from implied or explicit arguments.
       * Side-effects: set _scriptPath if args included script. Used for default program name, and subcommand searches.
       *
       * @private
       */
      _prepareUserArgs(argv, parseOptions) {
        if (argv !== void 0 && !Array.isArray(argv)) {
          throw new Error("first parameter to parse must be array or undefined");
        }
        parseOptions = parseOptions || {};
        if (argv === void 0 && parseOptions.from === void 0) {
          if (process2.versions?.electron) {
            parseOptions.from = "electron";
          }
          const execArgv = process2.execArgv ?? [];
          if (execArgv.includes("-e") || execArgv.includes("--eval") || execArgv.includes("-p") || execArgv.includes("--print")) {
            parseOptions.from = "eval";
          }
        }
        if (argv === void 0) {
          argv = process2.argv;
        }
        this.rawArgs = argv.slice();
        let userArgs;
        switch (parseOptions.from) {
          case void 0:
          case "node":
            this._scriptPath = argv[1];
            userArgs = argv.slice(2);
            break;
          case "electron":
            if (process2.defaultApp) {
              this._scriptPath = argv[1];
              userArgs = argv.slice(2);
            } else {
              userArgs = argv.slice(1);
            }
            break;
          case "user":
            userArgs = argv.slice(0);
            break;
          case "eval":
            userArgs = argv.slice(1);
            break;
          default:
            throw new Error(
              `unexpected parse option { from: '${parseOptions.from}' }`
            );
        }
        if (!this._name && this._scriptPath)
          this.nameFromFilename(this._scriptPath);
        this._name = this._name || "program";
        return userArgs;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * Use parseAsync instead of parse if any of your action handlers are async.
       *
       * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
       *
       * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
       * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
       * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
       * - `'user'`: just user arguments
       *
       * @example
       * program.parse(); // parse process.argv and auto-detect electron and special node flags
       * program.parse(process.argv); // assume argv[0] is app and argv[1] is script
       * program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv] - optional, defaults to process.argv
       * @param {object} [parseOptions] - optionally specify style of options with from: node/user/electron
       * @param {string} [parseOptions.from] - where the args are from: 'node', 'user', 'electron'
       * @return {Command} `this` command for chaining
       */
      parse(argv, parseOptions) {
        this._prepareForParse();
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        this._parseCommand([], userArgs);
        return this;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
       *
       * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
       * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
       * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
       * - `'user'`: just user arguments
       *
       * @example
       * await program.parseAsync(); // parse process.argv and auto-detect electron and special node flags
       * await program.parseAsync(process.argv); // assume argv[0] is app and argv[1] is script
       * await program.parseAsync(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv]
       * @param {object} [parseOptions]
       * @param {string} parseOptions.from - where the args are from: 'node', 'user', 'electron'
       * @return {Promise}
       */
      async parseAsync(argv, parseOptions) {
        this._prepareForParse();
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        await this._parseCommand([], userArgs);
        return this;
      }
      _prepareForParse() {
        if (this._savedState === null) {
          this.saveStateBeforeParse();
        } else {
          this.restoreStateBeforeParse();
        }
      }
      /**
       * Called the first time parse is called to save state and allow a restore before subsequent calls to parse.
       * Not usually called directly, but available for subclasses to save their custom state.
       *
       * This is called in a lazy way. Only commands used in parsing chain will have state saved.
       */
      saveStateBeforeParse() {
        this._savedState = {
          // name is stable if supplied by author, but may be unspecified for root command and deduced during parsing
          _name: this._name,
          // option values before parse have default values (including false for negated options)
          // shallow clones
          _optionValues: { ...this._optionValues },
          _optionValueSources: { ...this._optionValueSources }
        };
      }
      /**
       * Restore state before parse for calls after the first.
       * Not usually called directly, but available for subclasses to save their custom state.
       *
       * This is called in a lazy way. Only commands used in parsing chain will have state restored.
       */
      restoreStateBeforeParse() {
        if (this._storeOptionsAsProperties)
          throw new Error(`Can not call parse again when storeOptionsAsProperties is true.
- either make a new Command for each call to parse, or stop storing options as properties`);
        this._name = this._savedState._name;
        this._scriptPath = null;
        this.rawArgs = [];
        this._optionValues = { ...this._savedState._optionValues };
        this._optionValueSources = { ...this._savedState._optionValueSources };
        this.args = [];
        this.processedArgs = [];
      }
      /**
       * Throw if expected executable is missing. Add lots of help for author.
       *
       * @param {string} executableFile
       * @param {string} executableDir
       * @param {string} subcommandName
       */
      _checkForMissingExecutable(executableFile, executableDir, subcommandName) {
        if (fs.existsSync(executableFile)) return;
        const executableDirMessage = executableDir ? `searched for local subcommand relative to directory '${executableDir}'` : "no directory for search for local subcommand, use .executableDir() to supply a custom directory";
        const executableMissing = `'${executableFile}' does not exist
 - if '${subcommandName}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${executableDirMessage}`;
        throw new Error(executableMissing);
      }
      /**
       * Execute a sub-command executable.
       *
       * @private
       */
      _executeSubCommand(subcommand, args) {
        args = args.slice();
        let launchWithNode = false;
        const sourceExt = [".js", ".ts", ".tsx", ".mjs", ".cjs"];
        function findFile(baseDir, baseName) {
          const localBin = path.resolve(baseDir, baseName);
          if (fs.existsSync(localBin)) return localBin;
          if (sourceExt.includes(path.extname(baseName))) return void 0;
          const foundExt = sourceExt.find(
            (ext) => fs.existsSync(`${localBin}${ext}`)
          );
          if (foundExt) return `${localBin}${foundExt}`;
          return void 0;
        }
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        let executableFile = subcommand._executableFile || `${this._name}-${subcommand._name}`;
        let executableDir = this._executableDir || "";
        if (this._scriptPath) {
          let resolvedScriptPath;
          try {
            resolvedScriptPath = fs.realpathSync(this._scriptPath);
          } catch {
            resolvedScriptPath = this._scriptPath;
          }
          executableDir = path.resolve(
            path.dirname(resolvedScriptPath),
            executableDir
          );
        }
        if (executableDir) {
          let localFile = findFile(executableDir, executableFile);
          if (!localFile && !subcommand._executableFile && this._scriptPath) {
            const legacyName = path.basename(
              this._scriptPath,
              path.extname(this._scriptPath)
            );
            if (legacyName !== this._name) {
              localFile = findFile(
                executableDir,
                `${legacyName}-${subcommand._name}`
              );
            }
          }
          executableFile = localFile || executableFile;
        }
        launchWithNode = sourceExt.includes(path.extname(executableFile));
        let proc;
        if (process2.platform !== "win32") {
          if (launchWithNode) {
            args.unshift(executableFile);
            args = incrementNodeInspectorPort(process2.execArgv).concat(args);
            proc = childProcess.spawn(process2.argv[0], args, { stdio: "inherit" });
          } else {
            proc = childProcess.spawn(executableFile, args, { stdio: "inherit" });
          }
        } else {
          this._checkForMissingExecutable(
            executableFile,
            executableDir,
            subcommand._name
          );
          args.unshift(executableFile);
          args = incrementNodeInspectorPort(process2.execArgv).concat(args);
          proc = childProcess.spawn(process2.execPath, args, { stdio: "inherit" });
        }
        if (!proc.killed) {
          const signals = ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"];
          signals.forEach((signal) => {
            process2.on(signal, () => {
              if (proc.killed === false && proc.exitCode === null) {
                proc.kill(signal);
              }
            });
          });
        }
        const exitCallback = this._exitCallback;
        proc.on("close", (code) => {
          code = code ?? 1;
          if (!exitCallback) {
            process2.exit(code);
          } else {
            exitCallback(
              new CommanderError2(
                code,
                "commander.executeSubCommandAsync",
                "(close)"
              )
            );
          }
        });
        proc.on("error", (err) => {
          if (err.code === "ENOENT") {
            this._checkForMissingExecutable(
              executableFile,
              executableDir,
              subcommand._name
            );
          } else if (err.code === "EACCES") {
            throw new Error(`'${executableFile}' not executable`);
          }
          if (!exitCallback) {
            process2.exit(1);
          } else {
            const wrappedError = new CommanderError2(
              1,
              "commander.executeSubCommandAsync",
              "(error)"
            );
            wrappedError.nestedError = err;
            exitCallback(wrappedError);
          }
        });
        this.runningCommand = proc;
      }
      /**
       * @private
       */
      _dispatchSubcommand(commandName, operands, unknown) {
        const subCommand = this._findCommand(commandName);
        if (!subCommand) this.help({ error: true });
        subCommand._prepareForParse();
        let promiseChain;
        promiseChain = this._chainOrCallSubCommandHook(
          promiseChain,
          subCommand,
          "preSubcommand"
        );
        promiseChain = this._chainOrCall(promiseChain, () => {
          if (subCommand._executableHandler) {
            this._executeSubCommand(subCommand, operands.concat(unknown));
          } else {
            return subCommand._parseCommand(operands, unknown);
          }
        });
        return promiseChain;
      }
      /**
       * Invoke help directly if possible, or dispatch if necessary.
       * e.g. help foo
       *
       * @private
       */
      _dispatchHelpCommand(subcommandName) {
        if (!subcommandName) {
          this.help();
        }
        const subCommand = this._findCommand(subcommandName);
        if (subCommand && !subCommand._executableHandler) {
          subCommand.help();
        }
        return this._dispatchSubcommand(
          subcommandName,
          [],
          [this._getHelpOption()?.long ?? this._getHelpOption()?.short ?? "--help"]
        );
      }
      /**
       * Check this.args against expected this.registeredArguments.
       *
       * @private
       */
      _checkNumberOfArguments() {
        this.registeredArguments.forEach((arg, i) => {
          if (arg.required && this.args[i] == null) {
            this.missingArgument(arg.name());
          }
        });
        if (this.registeredArguments.length > 0 && this.registeredArguments[this.registeredArguments.length - 1].variadic) {
          return;
        }
        if (this.args.length > this.registeredArguments.length) {
          this._excessArguments(this.args);
        }
      }
      /**
       * Process this.args using this.registeredArguments and save as this.processedArgs!
       *
       * @private
       */
      _processArguments() {
        const myParseArg = (argument, value, previous) => {
          let parsedValue = value;
          if (value !== null && argument.parseArg) {
            const invalidValueMessage = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'.`;
            parsedValue = this._callParseArg(
              argument,
              value,
              previous,
              invalidValueMessage
            );
          }
          return parsedValue;
        };
        this._checkNumberOfArguments();
        const processedArgs = [];
        this.registeredArguments.forEach((declaredArg, index) => {
          let value = declaredArg.defaultValue;
          if (declaredArg.variadic) {
            if (index < this.args.length) {
              value = this.args.slice(index);
              if (declaredArg.parseArg) {
                value = value.reduce((processed, v) => {
                  return myParseArg(declaredArg, v, processed);
                }, declaredArg.defaultValue);
              }
            } else if (value === void 0) {
              value = [];
            }
          } else if (index < this.args.length) {
            value = this.args[index];
            if (declaredArg.parseArg) {
              value = myParseArg(declaredArg, value, declaredArg.defaultValue);
            }
          }
          processedArgs[index] = value;
        });
        this.processedArgs = processedArgs;
      }
      /**
       * Once we have a promise we chain, but call synchronously until then.
       *
       * @param {(Promise|undefined)} promise
       * @param {Function} fn
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCall(promise, fn) {
        if (promise?.then && typeof promise.then === "function") {
          return promise.then(() => fn());
        }
        return fn();
      }
      /**
       *
       * @param {(Promise|undefined)} promise
       * @param {string} event
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCallHooks(promise, event) {
        let result = promise;
        const hooks = [];
        this._getCommandAndAncestors().reverse().filter((cmd) => cmd._lifeCycleHooks[event] !== void 0).forEach((hookedCommand) => {
          hookedCommand._lifeCycleHooks[event].forEach((callback) => {
            hooks.push({ hookedCommand, callback });
          });
        });
        if (event === "postAction") {
          hooks.reverse();
        }
        hooks.forEach((hookDetail) => {
          result = this._chainOrCall(result, () => {
            return hookDetail.callback(hookDetail.hookedCommand, this);
          });
        });
        return result;
      }
      /**
       *
       * @param {(Promise|undefined)} promise
       * @param {Command} subCommand
       * @param {string} event
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCallSubCommandHook(promise, subCommand, event) {
        let result = promise;
        if (this._lifeCycleHooks[event] !== void 0) {
          this._lifeCycleHooks[event].forEach((hook) => {
            result = this._chainOrCall(result, () => {
              return hook(this, subCommand);
            });
          });
        }
        return result;
      }
      /**
       * Process arguments in context of this command.
       * Returns action result, in case it is a promise.
       *
       * @private
       */
      _parseCommand(operands, unknown) {
        const parsed = this.parseOptions(unknown);
        this._parseOptionsEnv();
        this._parseOptionsImplied();
        operands = operands.concat(parsed.operands);
        unknown = parsed.unknown;
        this.args = operands.concat(unknown);
        if (operands && this._findCommand(operands[0])) {
          return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
        }
        if (this._getHelpCommand() && operands[0] === this._getHelpCommand().name()) {
          return this._dispatchHelpCommand(operands[1]);
        }
        if (this._defaultCommandName) {
          this._outputHelpIfRequested(unknown);
          return this._dispatchSubcommand(
            this._defaultCommandName,
            operands,
            unknown
          );
        }
        if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName) {
          this.help({ error: true });
        }
        this._outputHelpIfRequested(parsed.unknown);
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        const checkForUnknownOptions = () => {
          if (parsed.unknown.length > 0) {
            this.unknownOption(parsed.unknown[0]);
          }
        };
        const commandEvent = `command:${this.name()}`;
        if (this._actionHandler) {
          checkForUnknownOptions();
          this._processArguments();
          let promiseChain;
          promiseChain = this._chainOrCallHooks(promiseChain, "preAction");
          promiseChain = this._chainOrCall(
            promiseChain,
            () => this._actionHandler(this.processedArgs)
          );
          if (this.parent) {
            promiseChain = this._chainOrCall(promiseChain, () => {
              this.parent.emit(commandEvent, operands, unknown);
            });
          }
          promiseChain = this._chainOrCallHooks(promiseChain, "postAction");
          return promiseChain;
        }
        if (this.parent?.listenerCount(commandEvent)) {
          checkForUnknownOptions();
          this._processArguments();
          this.parent.emit(commandEvent, operands, unknown);
        } else if (operands.length) {
          if (this._findCommand("*")) {
            return this._dispatchSubcommand("*", operands, unknown);
          }
          if (this.listenerCount("command:*")) {
            this.emit("command:*", operands, unknown);
          } else if (this.commands.length) {
            this.unknownCommand();
          } else {
            checkForUnknownOptions();
            this._processArguments();
          }
        } else if (this.commands.length) {
          checkForUnknownOptions();
          this.help({ error: true });
        } else {
          checkForUnknownOptions();
          this._processArguments();
        }
      }
      /**
       * Find matching command.
       *
       * @private
       * @return {Command | undefined}
       */
      _findCommand(name) {
        if (!name) return void 0;
        return this.commands.find(
          (cmd) => cmd._name === name || cmd._aliases.includes(name)
        );
      }
      /**
       * Return an option matching `arg` if any.
       *
       * @param {string} arg
       * @return {Option}
       * @package
       */
      _findOption(arg) {
        return this.options.find((option) => option.is(arg));
      }
      /**
       * Display an error message if a mandatory option does not have a value.
       * Called after checking for help flags in leaf subcommand.
       *
       * @private
       */
      _checkForMissingMandatoryOptions() {
        this._getCommandAndAncestors().forEach((cmd) => {
          cmd.options.forEach((anOption) => {
            if (anOption.mandatory && cmd.getOptionValue(anOption.attributeName()) === void 0) {
              cmd.missingMandatoryOptionValue(anOption);
            }
          });
        });
      }
      /**
       * Display an error message if conflicting options are used together in this.
       *
       * @private
       */
      _checkForConflictingLocalOptions() {
        const definedNonDefaultOptions = this.options.filter((option) => {
          const optionKey = option.attributeName();
          if (this.getOptionValue(optionKey) === void 0) {
            return false;
          }
          return this.getOptionValueSource(optionKey) !== "default";
        });
        const optionsWithConflicting = definedNonDefaultOptions.filter(
          (option) => option.conflictsWith.length > 0
        );
        optionsWithConflicting.forEach((option) => {
          const conflictingAndDefined = definedNonDefaultOptions.find(
            (defined) => option.conflictsWith.includes(defined.attributeName())
          );
          if (conflictingAndDefined) {
            this._conflictingOption(option, conflictingAndDefined);
          }
        });
      }
      /**
       * Display an error message if conflicting options are used together.
       * Called after checking for help flags in leaf subcommand.
       *
       * @private
       */
      _checkForConflictingOptions() {
        this._getCommandAndAncestors().forEach((cmd) => {
          cmd._checkForConflictingLocalOptions();
        });
      }
      /**
       * Parse options from `argv` removing known options,
       * and return argv split into operands and unknown arguments.
       *
       * Side effects: modifies command by storing options. Does not reset state if called again.
       *
       * Examples:
       *
       *     argv => operands, unknown
       *     --known kkk op => [op], []
       *     op --known kkk => [op], []
       *     sub --unknown uuu op => [sub], [--unknown uuu op]
       *     sub -- --unknown uuu op => [sub --unknown uuu op], []
       *
       * @param {string[]} args
       * @return {{operands: string[], unknown: string[]}}
       */
      parseOptions(args) {
        const operands = [];
        const unknown = [];
        let dest = operands;
        function maybeOption(arg) {
          return arg.length > 1 && arg[0] === "-";
        }
        const negativeNumberArg = (arg) => {
          if (!/^-(\d+|\d*\.\d+)(e[+-]?\d+)?$/.test(arg)) return false;
          return !this._getCommandAndAncestors().some(
            (cmd) => cmd.options.map((opt) => opt.short).some((short) => /^-\d$/.test(short))
          );
        };
        let activeVariadicOption = null;
        let activeGroup = null;
        let i = 0;
        while (i < args.length || activeGroup) {
          const arg = activeGroup ?? args[i++];
          activeGroup = null;
          if (arg === "--") {
            if (dest === unknown) dest.push(arg);
            dest.push(...args.slice(i));
            break;
          }
          if (activeVariadicOption && (!maybeOption(arg) || negativeNumberArg(arg))) {
            this.emit(`option:${activeVariadicOption.name()}`, arg);
            continue;
          }
          activeVariadicOption = null;
          if (maybeOption(arg)) {
            const option = this._findOption(arg);
            if (option) {
              if (option.required) {
                const value = args[i++];
                if (value === void 0) this.optionMissingArgument(option);
                this.emit(`option:${option.name()}`, value);
              } else if (option.optional) {
                let value = null;
                if (i < args.length && (!maybeOption(args[i]) || negativeNumberArg(args[i]))) {
                  value = args[i++];
                }
                this.emit(`option:${option.name()}`, value);
              } else {
                this.emit(`option:${option.name()}`);
              }
              activeVariadicOption = option.variadic ? option : null;
              continue;
            }
          }
          if (arg.length > 2 && arg[0] === "-" && arg[1] !== "-") {
            const option = this._findOption(`-${arg[1]}`);
            if (option) {
              if (option.required || option.optional && this._combineFlagAndOptionalValue) {
                this.emit(`option:${option.name()}`, arg.slice(2));
              } else {
                this.emit(`option:${option.name()}`);
                activeGroup = `-${arg.slice(2)}`;
              }
              continue;
            }
          }
          if (/^--[^=]+=/.test(arg)) {
            const index = arg.indexOf("=");
            const option = this._findOption(arg.slice(0, index));
            if (option && (option.required || option.optional)) {
              this.emit(`option:${option.name()}`, arg.slice(index + 1));
              continue;
            }
          }
          if (dest === operands && maybeOption(arg) && !(this.commands.length === 0 && negativeNumberArg(arg))) {
            dest = unknown;
          }
          if ((this._enablePositionalOptions || this._passThroughOptions) && operands.length === 0 && unknown.length === 0) {
            if (this._findCommand(arg)) {
              operands.push(arg);
              unknown.push(...args.slice(i));
              break;
            } else if (this._getHelpCommand() && arg === this._getHelpCommand().name()) {
              operands.push(arg, ...args.slice(i));
              break;
            } else if (this._defaultCommandName) {
              unknown.push(arg, ...args.slice(i));
              break;
            }
          }
          if (this._passThroughOptions) {
            dest.push(arg, ...args.slice(i));
            break;
          }
          dest.push(arg);
        }
        return { operands, unknown };
      }
      /**
       * Return an object containing local option values as key-value pairs.
       *
       * @return {object}
       */
      opts() {
        if (this._storeOptionsAsProperties) {
          const result = {};
          const len = this.options.length;
          for (let i = 0; i < len; i++) {
            const key = this.options[i].attributeName();
            result[key] = key === this._versionOptionName ? this._version : this[key];
          }
          return result;
        }
        return this._optionValues;
      }
      /**
       * Return an object containing merged local and global option values as key-value pairs.
       *
       * @return {object}
       */
      optsWithGlobals() {
        return this._getCommandAndAncestors().reduce(
          (combinedOptions, cmd) => Object.assign(combinedOptions, cmd.opts()),
          {}
        );
      }
      /**
       * Display error message and exit (or call exitOverride).
       *
       * @param {string} message
       * @param {object} [errorOptions]
       * @param {string} [errorOptions.code] - an id string representing the error
       * @param {number} [errorOptions.exitCode] - used with process.exit
       */
      error(message, errorOptions) {
        this._outputConfiguration.outputError(
          `${message}
`,
          this._outputConfiguration.writeErr
        );
        if (typeof this._showHelpAfterError === "string") {
          this._outputConfiguration.writeErr(`${this._showHelpAfterError}
`);
        } else if (this._showHelpAfterError) {
          this._outputConfiguration.writeErr("\n");
          this.outputHelp({ error: true });
        }
        const config = errorOptions || {};
        const exitCode = config.exitCode || 1;
        const code = config.code || "commander.error";
        this._exit(exitCode, code, message);
      }
      /**
       * Apply any option related environment variables, if option does
       * not have a value from cli or client code.
       *
       * @private
       */
      _parseOptionsEnv() {
        this.options.forEach((option) => {
          if (option.envVar && option.envVar in process2.env) {
            const optionKey = option.attributeName();
            if (this.getOptionValue(optionKey) === void 0 || ["default", "config", "env"].includes(
              this.getOptionValueSource(optionKey)
            )) {
              if (option.required || option.optional) {
                this.emit(`optionEnv:${option.name()}`, process2.env[option.envVar]);
              } else {
                this.emit(`optionEnv:${option.name()}`);
              }
            }
          }
        });
      }
      /**
       * Apply any implied option values, if option is undefined or default value.
       *
       * @private
       */
      _parseOptionsImplied() {
        const dualHelper = new DualOptions(this.options);
        const hasCustomOptionValue = (optionKey) => {
          return this.getOptionValue(optionKey) !== void 0 && !["default", "implied"].includes(this.getOptionValueSource(optionKey));
        };
        this.options.filter(
          (option) => option.implied !== void 0 && hasCustomOptionValue(option.attributeName()) && dualHelper.valueFromOption(
            this.getOptionValue(option.attributeName()),
            option
          )
        ).forEach((option) => {
          Object.keys(option.implied).filter((impliedKey) => !hasCustomOptionValue(impliedKey)).forEach((impliedKey) => {
            this.setOptionValueWithSource(
              impliedKey,
              option.implied[impliedKey],
              "implied"
            );
          });
        });
      }
      /**
       * Argument `name` is missing.
       *
       * @param {string} name
       * @private
       */
      missingArgument(name) {
        const message = `error: missing required argument '${name}'`;
        this.error(message, { code: "commander.missingArgument" });
      }
      /**
       * `Option` is missing an argument.
       *
       * @param {Option} option
       * @private
       */
      optionMissingArgument(option) {
        const message = `error: option '${option.flags}' argument missing`;
        this.error(message, { code: "commander.optionMissingArgument" });
      }
      /**
       * `Option` does not have a value, and is a mandatory option.
       *
       * @param {Option} option
       * @private
       */
      missingMandatoryOptionValue(option) {
        const message = `error: required option '${option.flags}' not specified`;
        this.error(message, { code: "commander.missingMandatoryOptionValue" });
      }
      /**
       * `Option` conflicts with another option.
       *
       * @param {Option} option
       * @param {Option} conflictingOption
       * @private
       */
      _conflictingOption(option, conflictingOption) {
        const findBestOptionFromValue = (option2) => {
          const optionKey = option2.attributeName();
          const optionValue = this.getOptionValue(optionKey);
          const negativeOption = this.options.find(
            (target) => target.negate && optionKey === target.attributeName()
          );
          const positiveOption = this.options.find(
            (target) => !target.negate && optionKey === target.attributeName()
          );
          if (negativeOption && (negativeOption.presetArg === void 0 && optionValue === false || negativeOption.presetArg !== void 0 && optionValue === negativeOption.presetArg)) {
            return negativeOption;
          }
          return positiveOption || option2;
        };
        const getErrorMessage = (option2) => {
          const bestOption = findBestOptionFromValue(option2);
          const optionKey = bestOption.attributeName();
          const source = this.getOptionValueSource(optionKey);
          if (source === "env") {
            return `environment variable '${bestOption.envVar}'`;
          }
          return `option '${bestOption.flags}'`;
        };
        const message = `error: ${getErrorMessage(option)} cannot be used with ${getErrorMessage(conflictingOption)}`;
        this.error(message, { code: "commander.conflictingOption" });
      }
      /**
       * Unknown option `flag`.
       *
       * @param {string} flag
       * @private
       */
      unknownOption(flag) {
        if (this._allowUnknownOption) return;
        let suggestion = "";
        if (flag.startsWith("--") && this._showSuggestionAfterError) {
          let candidateFlags = [];
          let command = this;
          do {
            const moreFlags = command.createHelp().visibleOptions(command).filter((option) => option.long).map((option) => option.long);
            candidateFlags = candidateFlags.concat(moreFlags);
            command = command.parent;
          } while (command && !command._enablePositionalOptions);
          suggestion = suggestSimilar(flag, candidateFlags);
        }
        const message = `error: unknown option '${flag}'${suggestion}`;
        this.error(message, { code: "commander.unknownOption" });
      }
      /**
       * Excess arguments, more than expected.
       *
       * @param {string[]} receivedArgs
       * @private
       */
      _excessArguments(receivedArgs) {
        if (this._allowExcessArguments) return;
        const expected = this.registeredArguments.length;
        const s = expected === 1 ? "" : "s";
        const forSubcommand = this.parent ? ` for '${this.name()}'` : "";
        const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${receivedArgs.length}.`;
        this.error(message, { code: "commander.excessArguments" });
      }
      /**
       * Unknown command.
       *
       * @private
       */
      unknownCommand() {
        const unknownName = this.args[0];
        let suggestion = "";
        if (this._showSuggestionAfterError) {
          const candidateNames = [];
          this.createHelp().visibleCommands(this).forEach((command) => {
            candidateNames.push(command.name());
            if (command.alias()) candidateNames.push(command.alias());
          });
          suggestion = suggestSimilar(unknownName, candidateNames);
        }
        const message = `error: unknown command '${unknownName}'${suggestion}`;
        this.error(message, { code: "commander.unknownCommand" });
      }
      /**
       * Get or set the program version.
       *
       * This method auto-registers the "-V, --version" option which will print the version number.
       *
       * You can optionally supply the flags and description to override the defaults.
       *
       * @param {string} [str]
       * @param {string} [flags]
       * @param {string} [description]
       * @return {(this | string | undefined)} `this` command for chaining, or version string if no arguments
       */
      version(str, flags, description) {
        if (str === void 0) return this._version;
        this._version = str;
        flags = flags || "-V, --version";
        description = description || "output the version number";
        const versionOption = this.createOption(flags, description);
        this._versionOptionName = versionOption.attributeName();
        this._registerOption(versionOption);
        this.on("option:" + versionOption.name(), () => {
          this._outputConfiguration.writeOut(`${str}
`);
          this._exit(0, "commander.version", str);
        });
        return this;
      }
      /**
       * Set the description.
       *
       * @param {string} [str]
       * @param {object} [argsDescription]
       * @return {(string|Command)}
       */
      description(str, argsDescription) {
        if (str === void 0 && argsDescription === void 0)
          return this._description;
        this._description = str;
        if (argsDescription) {
          this._argsDescription = argsDescription;
        }
        return this;
      }
      /**
       * Set the summary. Used when listed as subcommand of parent.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      summary(str) {
        if (str === void 0) return this._summary;
        this._summary = str;
        return this;
      }
      /**
       * Set an alias for the command.
       *
       * You may call more than once to add multiple aliases. Only the first alias is shown in the auto-generated help.
       *
       * @param {string} [alias]
       * @return {(string|Command)}
       */
      alias(alias) {
        if (alias === void 0) return this._aliases[0];
        let command = this;
        if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler) {
          command = this.commands[this.commands.length - 1];
        }
        if (alias === command._name)
          throw new Error("Command alias can't be the same as its name");
        const matchingCommand = this.parent?._findCommand(alias);
        if (matchingCommand) {
          const existingCmd = [matchingCommand.name()].concat(matchingCommand.aliases()).join("|");
          throw new Error(
            `cannot add alias '${alias}' to command '${this.name()}' as already have command '${existingCmd}'`
          );
        }
        command._aliases.push(alias);
        return this;
      }
      /**
       * Set aliases for the command.
       *
       * Only the first alias is shown in the auto-generated help.
       *
       * @param {string[]} [aliases]
       * @return {(string[]|Command)}
       */
      aliases(aliases) {
        if (aliases === void 0) return this._aliases;
        aliases.forEach((alias) => this.alias(alias));
        return this;
      }
      /**
       * Set / get the command usage `str`.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      usage(str) {
        if (str === void 0) {
          if (this._usage) return this._usage;
          const args = this.registeredArguments.map((arg) => {
            return humanReadableArgName(arg);
          });
          return [].concat(
            this.options.length || this._helpOption !== null ? "[options]" : [],
            this.commands.length ? "[command]" : [],
            this.registeredArguments.length ? args : []
          ).join(" ");
        }
        this._usage = str;
        return this;
      }
      /**
       * Get or set the name of the command.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      name(str) {
        if (str === void 0) return this._name;
        this._name = str;
        return this;
      }
      /**
       * Set/get the help group heading for this subcommand in parent command's help.
       *
       * @param {string} [heading]
       * @return {Command | string}
       */
      helpGroup(heading) {
        if (heading === void 0) return this._helpGroupHeading ?? "";
        this._helpGroupHeading = heading;
        return this;
      }
      /**
       * Set/get the default help group heading for subcommands added to this command.
       * (This does not override a group set directly on the subcommand using .helpGroup().)
       *
       * @example
       * program.commandsGroup('Development Commands:);
       * program.command('watch')...
       * program.command('lint')...
       * ...
       *
       * @param {string} [heading]
       * @returns {Command | string}
       */
      commandsGroup(heading) {
        if (heading === void 0) return this._defaultCommandGroup ?? "";
        this._defaultCommandGroup = heading;
        return this;
      }
      /**
       * Set/get the default help group heading for options added to this command.
       * (This does not override a group set directly on the option using .helpGroup().)
       *
       * @example
       * program
       *   .optionsGroup('Development Options:')
       *   .option('-d, --debug', 'output extra debugging')
       *   .option('-p, --profile', 'output profiling information')
       *
       * @param {string} [heading]
       * @returns {Command | string}
       */
      optionsGroup(heading) {
        if (heading === void 0) return this._defaultOptionGroup ?? "";
        this._defaultOptionGroup = heading;
        return this;
      }
      /**
       * @param {Option} option
       * @private
       */
      _initOptionGroup(option) {
        if (this._defaultOptionGroup && !option.helpGroupHeading)
          option.helpGroup(this._defaultOptionGroup);
      }
      /**
       * @param {Command} cmd
       * @private
       */
      _initCommandGroup(cmd) {
        if (this._defaultCommandGroup && !cmd.helpGroup())
          cmd.helpGroup(this._defaultCommandGroup);
      }
      /**
       * Set the name of the command from script filename, such as process.argv[1],
       * or require.main.filename, or __filename.
       *
       * (Used internally and public although not documented in README.)
       *
       * @example
       * program.nameFromFilename(require.main.filename);
       *
       * @param {string} filename
       * @return {Command}
       */
      nameFromFilename(filename) {
        this._name = path.basename(filename, path.extname(filename));
        return this;
      }
      /**
       * Get or set the directory for searching for executable subcommands of this command.
       *
       * @example
       * program.executableDir(__dirname);
       * // or
       * program.executableDir('subcommands');
       *
       * @param {string} [path]
       * @return {(string|null|Command)}
       */
      executableDir(path2) {
        if (path2 === void 0) return this._executableDir;
        this._executableDir = path2;
        return this;
      }
      /**
       * Return program help documentation.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to wrap for stderr instead of stdout
       * @return {string}
       */
      helpInformation(contextOptions) {
        const helper = this.createHelp();
        const context = this._getOutputContext(contextOptions);
        helper.prepareContext({
          error: context.error,
          helpWidth: context.helpWidth,
          outputHasColors: context.hasColors
        });
        const text3 = helper.formatHelp(this, helper);
        if (context.hasColors) return text3;
        return this._outputConfiguration.stripColor(text3);
      }
      /**
       * @typedef HelpContext
       * @type {object}
       * @property {boolean} error
       * @property {number} helpWidth
       * @property {boolean} hasColors
       * @property {function} write - includes stripColor if needed
       *
       * @returns {HelpContext}
       * @private
       */
      _getOutputContext(contextOptions) {
        contextOptions = contextOptions || {};
        const error = !!contextOptions.error;
        let baseWrite;
        let hasColors;
        let helpWidth;
        if (error) {
          baseWrite = (str) => this._outputConfiguration.writeErr(str);
          hasColors = this._outputConfiguration.getErrHasColors();
          helpWidth = this._outputConfiguration.getErrHelpWidth();
        } else {
          baseWrite = (str) => this._outputConfiguration.writeOut(str);
          hasColors = this._outputConfiguration.getOutHasColors();
          helpWidth = this._outputConfiguration.getOutHelpWidth();
        }
        const write = (str) => {
          if (!hasColors) str = this._outputConfiguration.stripColor(str);
          return baseWrite(str);
        };
        return { error, write, hasColors, helpWidth };
      }
      /**
       * Output help information for this command.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean } | Function} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      outputHelp(contextOptions) {
        let deprecatedCallback;
        if (typeof contextOptions === "function") {
          deprecatedCallback = contextOptions;
          contextOptions = void 0;
        }
        const outputContext = this._getOutputContext(contextOptions);
        const eventContext = {
          error: outputContext.error,
          write: outputContext.write,
          command: this
        };
        this._getCommandAndAncestors().reverse().forEach((command) => command.emit("beforeAllHelp", eventContext));
        this.emit("beforeHelp", eventContext);
        let helpInformation = this.helpInformation({ error: outputContext.error });
        if (deprecatedCallback) {
          helpInformation = deprecatedCallback(helpInformation);
          if (typeof helpInformation !== "string" && !Buffer.isBuffer(helpInformation)) {
            throw new Error("outputHelp callback must return a string or a Buffer");
          }
        }
        outputContext.write(helpInformation);
        if (this._getHelpOption()?.long) {
          this.emit(this._getHelpOption().long);
        }
        this.emit("afterHelp", eventContext);
        this._getCommandAndAncestors().forEach(
          (command) => command.emit("afterAllHelp", eventContext)
        );
      }
      /**
       * You can pass in flags and a description to customise the built-in help option.
       * Pass in false to disable the built-in help option.
       *
       * @example
       * program.helpOption('-?, --help' 'show help'); // customise
       * program.helpOption(false); // disable
       *
       * @param {(string | boolean)} flags
       * @param {string} [description]
       * @return {Command} `this` command for chaining
       */
      helpOption(flags, description) {
        if (typeof flags === "boolean") {
          if (flags) {
            if (this._helpOption === null) this._helpOption = void 0;
            if (this._defaultOptionGroup) {
              this._initOptionGroup(this._getHelpOption());
            }
          } else {
            this._helpOption = null;
          }
          return this;
        }
        this._helpOption = this.createOption(
          flags ?? "-h, --help",
          description ?? "display help for command"
        );
        if (flags || description) this._initOptionGroup(this._helpOption);
        return this;
      }
      /**
       * Lazy create help option.
       * Returns null if has been disabled with .helpOption(false).
       *
       * @returns {(Option | null)} the help option
       * @package
       */
      _getHelpOption() {
        if (this._helpOption === void 0) {
          this.helpOption(void 0, void 0);
        }
        return this._helpOption;
      }
      /**
       * Supply your own option to use for the built-in help option.
       * This is an alternative to using helpOption() to customise the flags and description etc.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addHelpOption(option) {
        this._helpOption = option;
        this._initOptionGroup(option);
        return this;
      }
      /**
       * Output help information and exit.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      help(contextOptions) {
        this.outputHelp(contextOptions);
        let exitCode = Number(process2.exitCode ?? 0);
        if (exitCode === 0 && contextOptions && typeof contextOptions !== "function" && contextOptions.error) {
          exitCode = 1;
        }
        this._exit(exitCode, "commander.help", "(outputHelp)");
      }
      /**
       * // Do a little typing to coordinate emit and listener for the help text events.
       * @typedef HelpTextEventContext
       * @type {object}
       * @property {boolean} error
       * @property {Command} command
       * @property {function} write
       */
      /**
       * Add additional text to be displayed with the built-in help.
       *
       * Position is 'before' or 'after' to affect just this command,
       * and 'beforeAll' or 'afterAll' to affect this command and all its subcommands.
       *
       * @param {string} position - before or after built-in help
       * @param {(string | Function)} text - string to add, or a function returning a string
       * @return {Command} `this` command for chaining
       */
      addHelpText(position, text3) {
        const allowedValues = ["beforeAll", "before", "after", "afterAll"];
        if (!allowedValues.includes(position)) {
          throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        const helpEvent = `${position}Help`;
        this.on(helpEvent, (context) => {
          let helpStr;
          if (typeof text3 === "function") {
            helpStr = text3({ error: context.error, command: context.command });
          } else {
            helpStr = text3;
          }
          if (helpStr) {
            context.write(`${helpStr}
`);
          }
        });
        return this;
      }
      /**
       * Output help information if help flags specified
       *
       * @param {Array} args - array of options to search for help flags
       * @private
       */
      _outputHelpIfRequested(args) {
        const helpOption = this._getHelpOption();
        const helpRequested = helpOption && args.find((arg) => helpOption.is(arg));
        if (helpRequested) {
          this.outputHelp();
          this._exit(0, "commander.helpDisplayed", "(outputHelp)");
        }
      }
    };
    function incrementNodeInspectorPort(args) {
      return args.map((arg) => {
        if (!arg.startsWith("--inspect")) {
          return arg;
        }
        let debugOption;
        let debugHost = "127.0.0.1";
        let debugPort = "9229";
        let match;
        if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
          debugOption = match[1];
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
          debugOption = match[1];
          if (/^\d+$/.test(match[3])) {
            debugPort = match[3];
          } else {
            debugHost = match[3];
          }
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
          debugOption = match[1];
          debugHost = match[3];
          debugPort = match[4];
        }
        if (debugOption && debugPort !== "0") {
          return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
        }
        return arg;
      });
    }
    function useColor() {
      if (process2.env.NO_COLOR || process2.env.FORCE_COLOR === "0" || process2.env.FORCE_COLOR === "false")
        return false;
      if (process2.env.FORCE_COLOR || process2.env.CLICOLOR_FORCE !== void 0)
        return true;
      return void 0;
    }
    exports.Command = Command2;
    exports.useColor = useColor;
  }
});

// node_modules/.pnpm/commander@14.0.3/node_modules/commander/index.js
var require_commander = __commonJS({
  "node_modules/.pnpm/commander@14.0.3/node_modules/commander/index.js"(exports) {
    var { Argument: Argument2 } = require_argument();
    var { Command: Command2 } = require_command();
    var { CommanderError: CommanderError2, InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var { Help: Help2 } = require_help();
    var { Option: Option2 } = require_option();
    exports.program = new Command2();
    exports.createCommand = (name) => new Command2(name);
    exports.createOption = (flags, description) => new Option2(flags, description);
    exports.createArgument = (name, description) => new Argument2(name, description);
    exports.Command = Command2;
    exports.Option = Option2;
    exports.Argument = Argument2;
    exports.Help = Help2;
    exports.CommanderError = CommanderError2;
    exports.InvalidArgumentError = InvalidArgumentError2;
    exports.InvalidOptionArgumentError = InvalidArgumentError2;
  }
});

// node_modules/.pnpm/commander@14.0.3/node_modules/commander/esm.mjs
var import_index = __toESM(require_commander(), 1);
var {
  program,
  createCommand,
  createArgument,
  createOption,
  CommanderError,
  InvalidArgumentError,
  InvalidOptionArgumentError,
  // deprecated old name
  Command,
  Argument,
  Option,
  Help
} = import_index.default;

// src/collectors/cursor.ts
import { appendFileSync, existsSync as existsSync3, readFileSync as readFileSync3 } from "node:fs";
import { homedir as homedir2 } from "node:os";
import { dirname as dirname2, join as join4 } from "node:path";

// src/core/config.ts
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
function stateDir() {
  const base = process.env.AI_REPORTER_STATE_DIR?.trim() || process.env.XDG_STATE_HOME?.trim() || join(homedir(), ".local", "state");
  return join(base, "ai-reporter");
}
function configDir() {
  const base = process.env.AI_REPORTER_CONFIG_DIR?.trim() || process.env.XDG_CONFIG_HOME?.trim() || join(homedir(), ".config");
  return join(base, "ai-reporter");
}
function dbPath() {
  return join(stateDir(), "ai-reporter.db");
}
function spoolDir() {
  return join(stateDir(), "telemetry");
}
function lockPath() {
  return join(stateDir(), "ai-reporter.lock");
}
function ensureDir(dir, mode = 448) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true, mode });
  }
}
function writeFileAtomic(path, content, mode = 384) {
  ensureDir(dirname(path));
  const tempPath = `${path}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
  writeFileSync(tempPath, content, { mode });
  renameSync(tempPath, path);
}
function readJsonFile(path) {
  if (!existsSync(path)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}
function writeJsonAtomic(path, data, mode = 384) {
  writeFileAtomic(path, `${JSON.stringify(data, null, 2)}
`, mode);
}

// src/core/project.ts
import { createHash } from "node:crypto";
import { existsSync as existsSync2, readFileSync as readFileSync2 } from "node:fs";
import { basename, join as join2, resolve } from "node:path";
var GITHUB_REPO_PATTERN = /(?:github\.com[/:])([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git)?$/;
function projectRef(cwd, explicitBranch) {
  if (!cwd) {
    return void 0;
  }
  const cleanPath = resolve(cwd);
  const dirHash = createHash("sha256").update(cleanPath).digest("hex").slice(0, 16);
  const name = basename(cleanPath) || "workspace";
  let gitBranch = explicitBranch?.trim() || void 0;
  let repo;
  const gitHead = join2(cleanPath, ".git", "HEAD");
  if (!gitBranch && existsSync2(gitHead)) {
    try {
      const head = readFileSync2(gitHead, "utf8").trim();
      if (head.startsWith("ref: refs/heads/")) {
        gitBranch = head.slice(16);
      }
    } catch {
    }
  }
  const gitConfig = join2(cleanPath, ".git", "config");
  if (existsSync2(gitConfig)) {
    try {
      const config = readFileSync2(gitConfig, "utf8");
      const match = config.match(GITHUB_REPO_PATTERN);
      if (match && match[1] && match[2]) {
        repo = `${match[1]}/${match[2]}`;
      }
    } catch {
    }
  }
  return {
    dirHash,
    name,
    ...gitBranch ? { gitBranch } : {},
    ...repo ? { repo } : {}
  };
}

// src/core/pricing.ts
import { join as join3 } from "node:path";
var DEFAULT_PRICING = {
  // Anthropic Claude
  "claude-3-7-sonnet": { inputPer1M: 3, outputPer1M: 15, cacheReadPer1M: 0.3, cacheWritePer1M: 3.75 },
  "claude-3-5-sonnet": { inputPer1M: 3, outputPer1M: 15, cacheReadPer1M: 0.3, cacheWritePer1M: 3.75 },
  "claude-3-5-haiku": { inputPer1M: 0.8, outputPer1M: 4, cacheReadPer1M: 0.08, cacheWritePer1M: 1 },
  "claude-3-opus": { inputPer1M: 15, outputPer1M: 75, cacheReadPer1M: 1.5, cacheWritePer1M: 18.75 },
  "claude-3-sonnet": { inputPer1M: 3, outputPer1M: 15, cacheReadPer1M: 0.75, cacheWritePer1M: 3.75 },
  "claude-3-haiku": { inputPer1M: 0.25, outputPer1M: 1.25, cacheReadPer1M: 0.0625, cacheWritePer1M: 0.3125 },
  // OpenAI
  "gpt-4o": { inputPer1M: 2.5, outputPer1M: 10, cacheReadPer1M: 1.25, cacheWritePer1M: 0 },
  "gpt-4o-mini": { inputPer1M: 0.15, outputPer1M: 0.6, cacheReadPer1M: 0.075, cacheWritePer1M: 0 },
  "o1": { inputPer1M: 15, outputPer1M: 60, cacheReadPer1M: 7.5, cacheWritePer1M: 0 },
  "o1-mini": { inputPer1M: 3, outputPer1M: 12, cacheReadPer1M: 1.5, cacheWritePer1M: 0 },
  "o3-mini": { inputPer1M: 1.1, outputPer1M: 4.4, cacheReadPer1M: 0.55, cacheWritePer1M: 0 },
  "gpt-4-turbo": { inputPer1M: 10, outputPer1M: 30, cacheReadPer1M: 0, cacheWritePer1M: 0 },
  // Google Gemini
  "gemini-2-5-pro": { inputPer1M: 1.25, outputPer1M: 5, cacheReadPer1M: 0.3125, cacheWritePer1M: 0 },
  "gemini-2-5-flash": { inputPer1M: 0.075, outputPer1M: 0.3, cacheReadPer1M: 0.01875, cacheWritePer1M: 0 },
  "gemini-2-0-flash": { inputPer1M: 0.1, outputPer1M: 0.4, cacheReadPer1M: 0.025, cacheWritePer1M: 0 },
  "gemini-1-5-pro": { inputPer1M: 1.25, outputPer1M: 5, cacheReadPer1M: 0.3125, cacheWritePer1M: 0 },
  "gemini-1-5-flash": { inputPer1M: 0.075, outputPer1M: 0.3, cacheReadPer1M: 0.01875, cacheWritePer1M: 0 },
  // DeepSeek
  "deepseek-v3": { inputPer1M: 0.14, outputPer1M: 0.28, cacheReadPer1M: 0.014, cacheWritePer1M: 0 },
  "deepseek-r1": { inputPer1M: 0.55, outputPer1M: 2.19, cacheReadPer1M: 0.14, cacheWritePer1M: 0 },
  // Qwen
  "qwen-2-5-coder": { inputPer1M: 0.2, outputPer1M: 0.6, cacheReadPer1M: 0.05, cacheWritePer1M: 0 },
  "qwen-2-5": { inputPer1M: 0.2, outputPer1M: 0.6, cacheReadPer1M: 0.05, cacheWritePer1M: 0 },
  // Mistral
  "codestral": { inputPer1M: 0.3, outputPer1M: 0.9, cacheReadPer1M: 0, cacheWritePer1M: 0 },
  "mistral-large": { inputPer1M: 2, outputPer1M: 6, cacheReadPer1M: 0, cacheWritePer1M: 0 }
};
function pricingFilePath() {
  return join3(configDir(), "pricing.json");
}
var cachedUserPricing = null;
function loadPricing() {
  if (cachedUserPricing) {
    return { ...DEFAULT_PRICING, ...cachedUserPricing };
  }
  const file = pricingFilePath();
  const user = readJsonFile(file);
  cachedUserPricing = user || {};
  return { ...DEFAULT_PRICING, ...cachedUserPricing };
}
function saveCustomPricing(model, price) {
  const current = readJsonFile(pricingFilePath()) || {};
  current[model] = price;
  writeJsonAtomic(pricingFilePath(), current);
  cachedUserPricing = current;
}
function findModelPrice(canonicalName, family) {
  const catalog = loadPricing();
  if (catalog[canonicalName]) {
    return catalog[canonicalName];
  }
  for (const [key, price] of Object.entries(catalog)) {
    if (canonicalName.includes(key) || key.includes(canonicalName)) {
      return price;
    }
  }
  if (family === "claude") {
    return catalog["claude-3-5-sonnet"];
  }
  if (family === "gemini") {
    return catalog["gemini-2-0-flash"];
  }
  if (family === "gpt") {
    return catalog["gpt-4o"];
  }
  if (family === "deepseek") {
    return catalog["deepseek-v3"];
  }
  if (family === "qwen") {
    return catalog["qwen-2-5-coder"];
  }
  return { inputPer1M: 1, outputPer1M: 3, cacheReadPer1M: 0.2, cacheWritePer1M: 0 };
}
function calculateCost(tokens, canonicalName, family, nativeCostUsd) {
  const price = findModelPrice(canonicalName, family);
  const computedCost = (tokens.input * price.inputPer1M + tokens.output * price.outputPer1M + tokens.cacheRead * price.cacheReadPer1M + tokens.cacheWrite * price.cacheWritePer1M) / 1e6;
  const savings = Math.max(
    0,
    tokens.cacheRead * (price.inputPer1M - price.cacheReadPer1M) / 1e6
  );
  const costUsd = typeof nativeCostUsd === "number" && nativeCostUsd > 0 ? nativeCostUsd : computedCost;
  return {
    costUsd: Math.round(costUsd * 1e5) / 1e5,
    costSavingsUsd: Math.round(savings * 1e5) / 1e5
  };
}

// src/core/schema.ts
var HARNESSES = [
  "antigravity",
  "claude-code",
  "cursor",
  "opencode",
  "copilot",
  "gemini-cli",
  "codex",
  "cline",
  "kilo-code",
  "pi",
  "omp",
  "qwen-code",
  "devin"
];
function eventId(harness, sessionId, nativeId) {
  return `${harness}:${sessionId}:${nativeId}`;
}
var OPENAI_PATTERN = /\bgpt|o[1-9]-|codex|openai/;
function modelFamily(raw) {
  const model = raw.toLowerCase();
  if (model.includes("claude")) {
    return "claude";
  }
  if (OPENAI_PATTERN.test(model)) {
    return "gpt";
  }
  if (model.includes("gemini")) {
    return "gemini";
  }
  if (model.includes("deepseek")) {
    return "deepseek";
  }
  if (model.includes("qwen")) {
    return "qwen";
  }
  if (model.includes("mistral") || model.includes("codestral")) {
    return "mistral";
  }
  return "other";
}
var CLOUD_PREFIX = /^(?:[a-z]{2,4}\.)?(?:anthropic|amazon|meta|mistral|cohere)\./;
var VARIANT_SUFFIX = /[:@].*$/;
var DATE_SUFFIX = /-(?:\d{8}|\d{4}-\d{2}-\d{2})$/;
var REVISION_SUFFIX = /-v\d+$/;
var VERSION_DOT = /(\d)\.(?=\d)/g;
function modelName(raw) {
  const lower = raw.trim().toLowerCase();
  const name = lower.slice(lower.lastIndexOf("/") + 1).replace(VARIANT_SUFFIX, "").replace(CLOUD_PREFIX, "").replace(REVISION_SUFFIX, "").replace(DATE_SUFFIX, "").replaceAll(VERSION_DOT, "$1-");
  return name || lower || "unknown";
}
var FAMILY_PROVIDER = {
  claude: "anthropic",
  gemini: "google",
  gpt: "openai",
  deepseek: "deepseek",
  qwen: "alibaba",
  mistral: "mistral",
  other: "unknown"
};
var PROVIDER_ALIASES = {
  "alibaba-cloud": "alibaba",
  "claude-code": "anthropic",
  dashscope: "alibaba",
  gemini: "google",
  "openai-codex": "openai",
  "openai-native": "openai",
  qwen: "alibaba",
  "vertex-ai": "vertex"
};
function modelProvider(reported, family) {
  const slug = reported?.trim().toLowerCase().replaceAll(/[\s_]+/g, "-");
  if (!slug) {
    return FAMILY_PROVIDER[family];
  }
  return PROVIDER_ALIASES[slug] ?? slug;
}
function canonicalModel(raw, reportedProvider) {
  const family = modelFamily(raw);
  return {
    family,
    name: modelName(raw),
    provider: modelProvider(reportedProvider, family),
    raw
  };
}
function totalTokens(tokens) {
  return (tokens.input || 0) + (tokens.output || 0) + (tokens.cacheRead || 0) + (tokens.cacheWrite || 0);
}
function outputWithReasoning(input) {
  if (input.total !== void 0 && input.prompt !== void 0) {
    return Math.max(
      input.output,
      input.total - input.prompt
    );
  }
  return input.separateByDefault ? input.output + input.reasoning : input.output;
}
function canonicalize(raw, observedAt = /* @__PURE__ */ new Date()) {
  const model = raw.model ? canonicalModel(raw.model.raw, raw.model.provider) : {
    family: "other",
    name: "unknown",
    provider: "unknown",
    raw: "unknown"
  };
  const tokens = raw.tokens ?? {
    cacheRead: 0,
    cacheWrite: 0,
    input: 0,
    output: 0
  };
  const total = totalTokens(tokens);
  const cost = calculateCost(
    {
      input: tokens.input,
      output: tokens.output,
      cacheRead: tokens.cacheRead,
      cacheWrite: tokens.cacheWrite
    },
    model.name,
    model.family,
    raw.costUsd
  );
  return {
    eventId: raw.eventId,
    type: raw.type,
    occurredAt: raw.occurredAt,
    observedAt: observedAt.toISOString(),
    harness: raw.harness,
    harnessVersion: raw.harnessVersion,
    sessionId: raw.sessionId,
    project: raw.project,
    model,
    tokens: {
      ...tokens,
      total
    },
    costUsd: cost.costUsd,
    costSavingsUsd: cost.costSavingsUsd,
    native: {
      ...raw.native?.requestId ? { requestId: raw.native.requestId } : {},
      ...raw.costUsd !== void 0 ? { costUsd: raw.costUsd } : {}
    }
  };
}
function validateEvent(event) {
  const issues = [];
  if (!event.eventId) {
    issues.push("missing eventId");
  }
  if (!event.occurredAt || Number.isNaN(Date.parse(event.occurredAt))) {
    issues.push("invalid occurredAt");
  }
  if (!HARNESSES.includes(event.harness)) {
    issues.push(`unrecognized harness: ${event.harness}`);
  }
  if (event.tokens) {
    for (const [k, v] of Object.entries(event.tokens)) {
      if (typeof v === "number" && (v < 0 || !Number.isFinite(v))) {
        issues.push(`invalid token count for ${k}: ${v}`);
      }
    }
  }
  return issues;
}

// src/collectors/jsonl-tail.ts
import { closeSync, openSync, readSync, statSync } from "node:fs";
import { StringDecoder } from "node:string_decoder";
var CHUNK = 64 * 1024;
function tailJsonl(path, cursors) {
  const stat = statSync(path);
  const previous = cursors.get(path);
  const rotated = previous !== void 0 && (previous.inode !== void 0 && previous.inode !== stat.ino || stat.size < previous.offset);
  let offset = rotated || previous === void 0 ? 0 : previous.offset;
  const cursor = {
    inode: stat.ino,
    mark: rotated ? void 0 : previous?.mark,
    mtimeMs: stat.mtimeMs,
    offset,
    seenSessions: rotated ? [] : previous?.seenSessions
  };
  if (stat.size <= offset) {
    return { cursor, lines: [] };
  }
  const lines = [];
  const buffer = Buffer.alloc(Math.min(CHUNK, stat.size - offset));
  const decoder = new StringDecoder("utf8");
  let fragments = [];
  const fd = openSync(path, "r");
  try {
    let remaining = stat.size - offset;
    while (remaining > 0) {
      const read = readSync(
        fd,
        buffer,
        0,
        Math.min(buffer.length, remaining),
        offset
      );
      if (read <= 0) {
        break;
      }
      const chunk = buffer.subarray(0, read);
      const text3 = decoder.write(chunk);
      let start = 0;
      for (let end = text3.indexOf("\n"); end !== -1; end = text3.indexOf("\n", start)) {
        const part = text3.slice(start, end);
        const line = fragments.length ? fragments.join("") + part : part;
        fragments = [];
        if (line.trim().length > 0) {
          lines.push(line);
        }
        start = end + 1;
      }
      if (start < text3.length) {
        fragments.push(text3.slice(start));
      }
      const lastNewline = chunk.lastIndexOf(10);
      if (lastNewline !== -1) {
        cursor.offset = offset + lastNewline + 1;
      }
      offset += read;
      remaining -= read;
    }
  } finally {
    closeSync(fd);
  }
  return { cursor, lines };
}
function parseJsonLine(line) {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

// src/collectors/cursor.ts
var CURSOR = "cursor";
function nonEmpty(value) {
  return typeof value === "string" && value.trim() ? value.trim() : void 0;
}
function token(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
}
function cursorHome() {
  return process.env.CURSOR_HOME?.trim() || join4(homedir2(), ".cursor");
}
function cursorEventPath() {
  return join4(stateDir(), "cursor-events.jsonl");
}
function cursorHookCommand() {
  return "ai-reporter _cursor-hook";
}
function recordCursorHook(value, path = cursorEventPath(), now = Date.now()) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const input = value;
  const conversationId = nonEmpty(input.conversation_id);
  const generationId = nonEmpty(input.generation_id);
  const model = nonEmpty(input.model);
  if (!(conversationId && generationId && model)) {
    return false;
  }
  const record3 = {
    cache_read_tokens: token(input.cache_read_tokens),
    cache_write_tokens: token(input.cache_write_tokens),
    conversation_id: conversationId,
    ...nonEmpty(input.cursor_version) ? { cursor_version: nonEmpty(input.cursor_version) } : {},
    generation_id: generationId,
    input_tokens: token(input.input_tokens),
    model,
    occurred_at: new Date(now).toISOString(),
    output_tokens: token(input.output_tokens),
    workspace_roots: Array.isArray(input.workspace_roots) ? input.workspace_roots.filter(
      (root) => typeof root === "string" && root.length > 0
    ) : []
  };
  if (record3.input_tokens + record3.output_tokens + record3.cache_read_tokens + record3.cache_write_tokens === 0) {
    return false;
  }
  ensureDir(dirname2(path), 448);
  appendFileSync(path, `${JSON.stringify(record3)}
`, {
    encoding: "utf8",
    mode: 384
  });
  return true;
}
function normalizeCursorHook(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const row = value;
  const sessionId = nonEmpty(row.conversation_id);
  const nativeId = nonEmpty(row.generation_id);
  const model = nonEmpty(row.model);
  const occurredAt = nonEmpty(row.occurred_at);
  if (!(sessionId && nativeId && model && occurredAt)) {
    return null;
  }
  const roots = Array.isArray(row.workspace_roots) ? row.workspace_roots.filter(
    (root) => typeof root === "string" && root.length > 0
  ) : [];
  return {
    eventId: eventId(CURSOR, sessionId, nativeId),
    harness: CURSOR,
    harnessVersion: nonEmpty(row.cursor_version),
    model: { family: modelFamily(model), provider: "cursor", raw: model },
    occurredAt,
    project: projectRef(roots[0]),
    sessionId,
    tokens: {
      cacheRead: token(row.cache_read_tokens),
      cacheWrite: token(row.cache_write_tokens),
      input: token(row.input_tokens),
      output: token(row.output_tokens)
    },
    type: "usage"
  };
}
function installCursorHooks(home = cursorHome()) {
  const hooksPath = join4(home, "hooks.json");
  let config = {};
  if (existsSync3(hooksPath)) {
    try {
      config = JSON.parse(readFileSync3(hooksPath, "utf8"));
    } catch {
      return "error";
    }
  }
  const cmd = cursorHookCommand();
  const hooks = config.hooks ?? {};
  const hookPayload = [{ command: cmd }];
  let changed = false;
  for (const hookName of ["afterAgentResponse", "stop"]) {
    const existing = hooks[hookName];
    if (JSON.stringify(existing) !== JSON.stringify(hookPayload)) {
      hooks[hookName] = hookPayload;
      changed = true;
    }
  }
  if (changed) {
    ensureDir(home);
    writeFileAtomic(
      hooksPath,
      `${JSON.stringify({ ...config, hooks, version: 1 }, null, 2)}
`
    );
    return "installed";
  }
  return "unchanged";
}
async function* collectCursor(eventPath = cursorEventPath(), ctx) {
  if (!existsSync3(eventPath)) {
    return;
  }
  let result;
  try {
    result = tailJsonl(eventPath, ctx.cursors);
  } catch (error) {
    ctx.log(`cursor: cannot tail ${eventPath}: ${String(error)}`);
    return;
  }
  for (const line of result.lines) {
    const row = parseJsonLine(line);
    const event = normalizeCursorHook(row);
    if (!event) {
      continue;
    }
    if (ctx.since && Date.parse(event.occurredAt) < ctx.since) {
      continue;
    }
    yield event;
  }
  ctx.cursors.set(eventPath, result.cursor);
}
var cursorCollector = {
  id: CURSOR,
  name: "Cursor",
  discover: () => {
    const home = cursorHome();
    const eventLog = cursorEventPath();
    const found = existsSync3(home) || existsSync3(eventLog);
    return Promise.resolve(found ? [home] : []);
  },
  prepare: async (log) => {
    if (existsSync3(cursorHome())) {
      try {
        const res = installCursorHooks();
        if (res === "installed") {
          log("cursor: installed afterAgentResponse and stop hooks in ~/.cursor/hooks.json");
        }
      } catch (e) {
        log(`cursor: hook setup warning: ${String(e)}`);
      }
    }
  },
  collect: (ctx) => collectCursor(cursorEventPath(), ctx)
};

// src/commands/cursor-hook.ts
var MAX_HOOK_BYTES = 8 * 1024 * 1024;
async function readStdin() {
  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of process.stdin) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buf.length;
    if (totalBytes > MAX_HOOK_BYTES) {
      return null;
    }
    chunks.push(buf);
  }
  try {
    const raw = Buffer.concat(chunks).toString("utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function registerCursorHook(program3) {
  program3.command("_cursor-hook", { hidden: true }).description("Internal hook receiver for Cursor afterAgentResponse and stop").action(async () => {
    const input = await readStdin();
    if (input !== null) {
      recordCursorHook(input);
    }
  });
}

// src/engine/lock.ts
import { existsSync as existsSync4, readFileSync as readFileSync4, unlinkSync, writeFileSync as writeFileSync2 } from "node:fs";
import { dirname as dirname3 } from "node:path";
function tryAcquireLock() {
  const path = lockPath();
  ensureDir(dirname3(path));
  if (existsSync4(path)) {
    const raw = readFileSync4(path, "utf8").trim();
    const pid = Number(raw);
    let alive = false;
    if (Number.isFinite(pid) && pid > 0) {
      try {
        process.kill(pid, 0);
        alive = true;
      } catch {
        alive = false;
      }
    }
    if (alive && pid !== process.pid) {
      return { acquired: false, pid };
    }
  }
  writeFileSync2(path, `${process.pid}
`, { mode: 384 });
  const release = () => {
    try {
      if (existsSync4(path)) {
        const raw = readFileSync4(path, "utf8").trim();
        if (Number(raw) === process.pid) {
          unlinkSync(path);
        }
      }
    } catch {
    }
  };
  return { acquired: true, release };
}
function acquireLock() {
  const res = tryAcquireLock();
  if (!res.acquired) {
    throw new Error(`Another AI-Reporter watcher/daemon is running (pid ${res.pid}).`);
  }
  return res.release;
}

// src/collectors/antigravity.ts
import { existsSync as existsSync6, readdirSync, statSync as statSync3 } from "node:fs";
import { homedir as homedir3 } from "node:os";
import { basename as basename2, dirname as dirname4, join as join5 } from "node:path";
import { fileURLToPath } from "node:url";

// src/collectors/sqlite.ts
import { DatabaseSync } from "node:sqlite";
import { existsSync as existsSync5, statSync as statSync2 } from "node:fs";
function openReadOnly(path) {
  return new DatabaseSync(path, { readOnly: true });
}
function lastWriteMs(path) {
  const wal = `${path}-wal`;
  return Math.max(
    statSync2(path).mtimeMs,
    existsSync5(wal) ? statSync2(wal).mtimeMs : 0
  );
}

// src/collectors/antigravity.ts
var ANTIGRAVITY = "antigravity";
var STEP_CREATED = 1;
var STEP_USAGE = 9;
var USAGE_MODEL = 1;
var USAGE_INPUT = 2;
var USAGE_OUTPUT = 3;
var USAGE_CACHE_READ = 5;
var USAGE_THOUGHTS = 10;
var GENERATION = 1;
var GENERATION_USAGE = 4;
var GENERATION_MODEL_NAME = 19;
var TIMESTAMP_SECONDS = 1;
var TIMESTAMP_NANOS = 2;
var NANOS_PER_MS = 1e6;
var VARINT_BASE = 128;
var WIRE_TYPES = 8;
function decodeMessage(bytes) {
  const fields = [];
  let offset = 0;
  const varint = () => {
    let result = 0;
    let weight = 1;
    for (; ; ) {
      if (offset >= bytes.length) {
        throw new Error("truncated protobuf message");
      }
      const byte = bytes[offset++];
      result += byte % VARINT_BASE * weight;
      if (byte < VARINT_BASE) {
        return result;
      }
      weight *= VARINT_BASE;
    }
  };
  const take = (length) => {
    if (offset + length > bytes.length) {
      throw new Error("truncated protobuf message");
    }
    const slice = bytes.subarray(offset, offset + length);
    offset += length;
    return slice;
  };
  while (offset < bytes.length) {
    const tag = varint();
    const number = Math.floor(tag / WIRE_TYPES);
    const wireType = tag % WIRE_TYPES;
    if (wireType === 0) {
      fields.push({ number, value: varint() });
    } else if (wireType === 1) {
      fields.push({ number, value: take(8) });
    } else if (wireType === 2) {
      fields.push({ number, value: take(varint()) });
    } else if (wireType === 5) {
      fields.push({ number, value: take(4) });
    } else {
      throw new Error(`unsupported protobuf wire type ${wireType}`);
    }
  }
  return fields;
}
function nested(fields, number) {
  const value = fields.find((field) => field.number === number)?.value;
  return value instanceof Uint8Array ? decodeMessage(value) : null;
}
function integer(fields, number) {
  const value = fields.find((field) => field.number === number)?.value;
  return typeof value === "number" ? value : null;
}
function text(fields, number) {
  const value = fields.find((field) => field.number === number)?.value;
  return value instanceof Uint8Array ? new TextDecoder().decode(value) : null;
}
function modelOf(row) {
  if (!row.data) {
    return null;
  }
  try {
    const generation = nested(decodeMessage(row.data), GENERATION);
    const usage2 = generation && nested(generation, GENERATION_USAGE);
    const code = usage2 && integer(usage2, USAGE_MODEL);
    const name = generation && text(generation, GENERATION_MODEL_NAME);
    return code === null || !name ? null : [code, name];
  } catch {
    return null;
  }
}
function modelNames(rows) {
  const names = /* @__PURE__ */ new Map();
  for (const row of rows) {
    const model = modelOf(row);
    if (model) {
      names.set(model[0], model[1]);
    }
  }
  return names;
}
function normalizeAntigravityStep(row, context) {
  if (!row.metadata) {
    return null;
  }
  try {
    const fields = decodeMessage(row.metadata);
    const usage2 = nested(fields, STEP_USAGE);
    const created = nested(fields, STEP_CREATED);
    if (!(usage2 && created)) {
      return null;
    }
    const seconds = integer(created, TIMESTAMP_SECONDS);
    if (seconds === null) {
      return null;
    }
    const nanos = integer(created, TIMESTAMP_NANOS) ?? 0;
    const input = integer(usage2, USAGE_INPUT) ?? 0;
    const output = integer(usage2, USAGE_OUTPUT) ?? 0;
    const cacheRead = integer(usage2, USAGE_CACHE_READ) ?? 0;
    if (input + output + cacheRead === 0) {
      return null;
    }
    const code = integer(usage2, USAGE_MODEL);
    const model = (code === null ? void 0 : context.models.get(code)) ?? "unknown";
    const thoughts = context.includeReasoning === false ? null : integer(usage2, USAGE_THOUGHTS);
    return {
      eventId: eventId(ANTIGRAVITY, context.sessionId, row.idx),
      harness: ANTIGRAVITY,
      model: { family: modelFamily(model), provider: "google", raw: model },
      occurredAt: new Date(
        seconds * 1e3 + Math.floor(nanos / NANOS_PER_MS)
      ).toISOString(),
      project: projectRef(context.cwd),
      sessionId: context.sessionId,
      tokens: {
        cacheRead,
        cacheWrite: 0,
        input,
        output,
        ...thoughts === null ? {} : { reasoning: thoughts }
      },
      type: "usage"
    };
  } catch {
    return null;
  }
}
function antigravityConversationsDirs(home = homedir3()) {
  return ["antigravity-cli", "antigravity", "antigravity-ide"].map((name) => join5(home, ".gemini", name, "conversations")).filter((path) => {
    try {
      return statSync3(path).isDirectory();
    } catch {
      return false;
    }
  });
}
function firstWorkspace(uris) {
  let parsed;
  try {
    parsed = JSON.parse(uris);
  } catch {
    return;
  }
  const first = Array.isArray(parsed) ? parsed[0] : void 0;
  return typeof first === "string" && first.startsWith("file://") ? fileURLToPath(first) : void 0;
}
function workspaces(summariesDb, log) {
  const out = /* @__PURE__ */ new Map();
  if (!existsSync6(summariesDb)) {
    return out;
  }
  let db;
  try {
    db = openReadOnly(summariesDb);
    const rows = db.prepare(
      "SELECT conversation_id, workspace_uris FROM conversation_summaries"
    ).all();
    for (const row of rows) {
      const cwd = firstWorkspace(row.workspace_uris);
      if (cwd) {
        out.set(row.conversation_id, cwd);
      }
    }
  } catch (error) {
    log(`antigravity: cannot read ${summariesDb}: ${String(error)}`);
  } finally {
    db?.close();
  }
  return out;
}
async function* collectAntigravity(dirs, ctx) {
  for (const dir of dirs) {
    const includeReasoning = !["antigravity", "antigravity-ide"].includes(
      basename2(dirname4(dir))
    );
    const cwds = workspaces(
      join5(dirname4(dir), "conversation_summaries.db"),
      ctx.log
    );
    let paths;
    try {
      paths = readdirSync(dir).filter((name) => name.endsWith(".db")).sort().map((name) => join5(dir, name));
    } catch (error) {
      ctx.log(`antigravity: cannot read ${dir}: ${String(error)}`);
      continue;
    }
    for (const path of paths) {
      const mtimeMs = lastWriteMs(path);
      const previous = ctx.cursors.get(path);
      if (previous && previous.mtimeMs === mtimeMs) {
        continue;
      }
      const sessionId = basename2(path, ".db");
      const announced = new Set(previous?.seenSessions || []);
      let mark = typeof previous?.mark === "number" ? previous.mark : -1;
      let db;
      let models;
      let steps;
      try {
        db = openReadOnly(path);
        const genRows = db.prepare("SELECT data FROM gen_metadata").all();
        models = modelNames(genRows);
        steps = db.prepare(
          "SELECT idx, metadata FROM steps WHERE idx > ? ORDER BY idx ASC"
        ).all(mark);
      } catch (error) {
        ctx.log(`antigravity: cannot read ${path}: ${String(error)}`);
        continue;
      } finally {
        db?.close();
      }
      const context = {
        cwd: cwds.get(sessionId),
        includeReasoning,
        models,
        sessionId
      };
      for (const row of steps) {
        mark = Math.max(mark, row.idx);
        const event = normalizeAntigravityStep(row, context);
        if (!event || ctx.since && Date.parse(event.occurredAt) < ctx.since) {
          continue;
        }
        if (!announced.has(sessionId)) {
          announced.add(sessionId);
          yield {
            eventId: eventId(ANTIGRAVITY, sessionId, "start"),
            harness: ANTIGRAVITY,
            occurredAt: event.occurredAt,
            project: event.project,
            sessionId,
            type: "session.start"
          };
        }
        yield event;
      }
      ctx.cursors.set(path, {
        mark,
        mtimeMs,
        offset: 0,
        seenSessions: [...announced]
      });
    }
  }
}
var antigravityCollector = {
  id: ANTIGRAVITY,
  name: "Antigravity",
  discover: () => Promise.resolve(antigravityConversationsDirs()),
  collect: (ctx) => collectAntigravity(antigravityConversationsDirs(), ctx)
};

// src/collectors/claude-code.ts
import { existsSync as existsSync7, readdirSync as readdirSync2, statSync as statSync4 } from "node:fs";
import { homedir as homedir4 } from "node:os";
import { join as join6 } from "node:path";
var CLAUDE_CODE = "claude-code";
function isAssistantLine(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const v = value;
  const message = v.message;
  return v.type === "assistant" && typeof v.sessionId === "string" && typeof v.timestamp === "string" && typeof message?.id === "string" && typeof message.usage === "object" && message.usage !== null;
}
function normalizeClaudeCode(value) {
  if (!isAssistantLine(value)) {
    return null;
  }
  const { model } = value.message;
  if (!model || model === "<synthetic>") {
    return null;
  }
  const usage2 = value.message.usage ?? {};
  const occurred = Date.parse(value.timestamp);
  if (Number.isNaN(occurred)) {
    return null;
  }
  const reasoning = usage2.output_tokens_details?.thinking_tokens;
  return {
    eventId: eventId(CLAUDE_CODE, value.sessionId, value.message.id),
    harness: CLAUDE_CODE,
    harnessVersion: value.version,
    model: { family: modelFamily(model), provider: "anthropic", raw: model },
    native: value.requestId ? { requestId: value.requestId } : void 0,
    occurredAt: new Date(occurred).toISOString(),
    project: projectRef(value.cwd, value.gitBranch),
    sessionId: value.sessionId,
    tokens: {
      cacheRead: usage2.cache_read_input_tokens ?? 0,
      cacheWrite: usage2.cache_creation_input_tokens ?? 0,
      input: usage2.input_tokens ?? 0,
      output: usage2.output_tokens ?? 0,
      ...reasoning === void 0 ? {} : { reasoning }
    },
    type: "usage"
  };
}
function claudeConfigDir() {
  return process.env.CLAUDE_CONFIG_DIR?.trim() || join6(homedir4(), ".claude");
}
function listTranscripts(root) {
  const projects = join6(root, "projects");
  if (!existsSync7(projects)) {
    return [];
  }
  const files = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync2(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join6(dir, entry);
      let stat;
      try {
        stat = statSync4(full);
      } catch {
        continue;
      }
      if (stat.isDirectory()) {
        walk(full);
      } else if (entry.endsWith(".jsonl")) {
        files.push(full);
      }
    }
  };
  walk(projects);
  return files;
}
async function* collectClaudeCode(roots, ctx) {
  const seenMessages = /* @__PURE__ */ new Set();
  for (const root of roots) {
    const files = listTranscripts(root);
    for (const path of files) {
      let stat;
      try {
        stat = statSync4(path);
      } catch {
        continue;
      }
      const previous = ctx.cursors.get(path);
      if (previous && previous.mtimeMs === stat.mtimeMs) {
        continue;
      }
      let result;
      try {
        result = tailJsonl(path, ctx.cursors);
      } catch (error) {
        ctx.log(`claude-code: cannot tail ${path}: ${String(error)}`);
        continue;
      }
      const announced = new Set(result.cursor.seenSessions || []);
      for (const line of result.lines) {
        const row = parseJsonLine(line);
        const event = normalizeClaudeCode(row);
        if (!event || seenMessages.has(event.eventId)) {
          continue;
        }
        if (ctx.since && Date.parse(event.occurredAt) < ctx.since) {
          continue;
        }
        seenMessages.add(event.eventId);
        if (!announced.has(event.sessionId)) {
          announced.add(event.sessionId);
          yield {
            eventId: eventId(CLAUDE_CODE, event.sessionId, "start"),
            harness: CLAUDE_CODE,
            harnessVersion: event.harnessVersion,
            occurredAt: event.occurredAt,
            project: event.project,
            sessionId: event.sessionId,
            type: "session.start"
          };
        }
        yield event;
      }
      ctx.cursors.set(path, {
        ...result.cursor,
        seenSessions: [...announced]
      });
    }
  }
}
var claudeCodeCollector = {
  id: CLAUDE_CODE,
  name: "Claude Code",
  discover: () => {
    const dir = claudeConfigDir();
    return Promise.resolve(existsSync7(dir) ? [dir] : []);
  },
  collect: (ctx) => collectClaudeCode([claudeConfigDir()], ctx)
};

// src/collectors/opencode.ts
import { existsSync as existsSync8 } from "node:fs";
import { homedir as homedir5 } from "node:os";
import { join as join7 } from "node:path";
var OPENCODE = "opencode";
function normalizeOpenCode(row, harness = OPENCODE) {
  let data;
  try {
    data = JSON.parse(row.data);
  } catch {
    return null;
  }
  if (data.role !== "assistant" || !data.tokens || !data.time?.completed) {
    return null;
  }
  const model = data.modelID ?? "unknown";
  const cacheRead = data.tokens.cache?.read ?? 0;
  const cacheWrite = data.tokens.cache?.write ?? 0;
  const input = data.tokens.input ?? 0;
  const output = outputWithReasoning({
    output: data.tokens.output ?? 0,
    prompt: input + cacheRead + cacheWrite,
    reasoning: data.tokens.reasoning ?? 0,
    separateByDefault: true,
    total: data.tokens.total ?? 0
  });
  return {
    eventId: eventId(harness, row.session_id, row.id),
    harness,
    model: {
      family: modelFamily(model),
      provider: data.providerID,
      raw: model
    },
    occurredAt: new Date(data.time.completed).toISOString(),
    project: projectRef(data.path?.cwd),
    sessionId: row.session_id,
    tokens: {
      cacheRead,
      cacheWrite,
      input,
      output,
      ...data.tokens.reasoning === void 0 ? {} : { reasoning: data.tokens.reasoning }
    },
    type: "usage",
    ...typeof data.cost === "number" && data.cost > 0 ? { costUsd: data.cost } : {}
  };
}
function openCodeDbPath() {
  const data = process.env.XDG_DATA_HOME?.trim() || join7(homedir5(), ".local", "share");
  return join7(data, "opencode", "opencode.db");
}
async function* collectOpenCodeFromDb(path, ctx, harness = OPENCODE) {
  if (!existsSync8(path)) {
    return;
  }
  const mtimeMs = lastWriteMs(path);
  const previous = ctx.cursors.get(path);
  if (previous && previous.mtimeMs === mtimeMs) {
    return;
  }
  const announced = new Set(previous?.seenSessions || []);
  let mark = typeof previous?.mark === "number" ? previous.mark : 0;
  let db;
  let rows;
  try {
    db = openReadOnly(path);
    rows = db.prepare(
      "SELECT id, session_id, time_updated, data FROM message WHERE time_updated > ? ORDER BY time_updated ASC"
    ).all(mark);
  } catch (error) {
    ctx.log(`${harness}: cannot read ${path}: ${String(error)}`);
    return;
  } finally {
    db?.close();
  }
  for (const row of rows) {
    mark = Math.max(mark, row.time_updated);
    const event = normalizeOpenCode(row, harness);
    if (!event || ctx.since && Date.parse(event.occurredAt) < ctx.since) {
      continue;
    }
    if (!announced.has(row.session_id)) {
      announced.add(row.session_id);
      yield {
        eventId: eventId(harness, row.session_id, "start"),
        harness,
        occurredAt: event.occurredAt,
        project: event.project,
        sessionId: row.session_id,
        type: "session.start"
      };
    }
    yield event;
  }
  ctx.cursors.set(path, {
    mark,
    mtimeMs,
    offset: 0,
    seenSessions: [...announced]
  });
}
var openCodeCollector = {
  id: OPENCODE,
  name: "OpenCode",
  discover: () => {
    const p = openCodeDbPath();
    return Promise.resolve(existsSync8(p) ? [p] : []);
  },
  collect: (ctx) => collectOpenCodeFromDb(openCodeDbPath(), ctx, OPENCODE)
};

// src/collectors/copilot.ts
import { existsSync as existsSync9, readdirSync as readdirSync3, statSync as statSync5 } from "node:fs";
import { homedir as homedir6 } from "node:os";
import { basename as basename3, dirname as dirname5, join as join8 } from "node:path";
var COPILOT = "copilot";
var EVENTS_FILE = "events.jsonl";
function record(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value : void 0;
}
function text2(value) {
  return typeof value === "string" && value.trim() ? value.trim() : void 0;
}
function count(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
}
function usage(value) {
  const row = record(value);
  if (!row) {
    return;
  }
  return {
    cacheReadTokens: count(row.cacheReadTokens),
    cacheWriteTokens: count(row.cacheWriteTokens),
    inputTokens: count(row.inputTokens),
    outputTokens: count(row.outputTokens),
    reasoningTokens: count(row.reasoningTokens)
  };
}
function delta(current, previous) {
  const subtract = (next, prior) => prior === void 0 || next < prior ? next : next - prior;
  return {
    cacheReadTokens: subtract(
      current.cacheReadTokens,
      previous?.cacheReadTokens
    ),
    cacheWriteTokens: subtract(
      current.cacheWriteTokens,
      previous?.cacheWriteTokens
    ),
    inputTokens: subtract(current.inputTokens, previous?.inputTokens),
    outputTokens: subtract(current.outputTokens, previous?.outputTokens),
    reasoningTokens: subtract(
      current.reasoningTokens,
      previous?.reasoningTokens
    )
  };
}
function copilotHome() {
  return process.env.COPILOT_HOME?.trim() || join8(homedir6(), ".copilot");
}
function initialCopilotState(path) {
  return {
    previous: {},
    sessionId: basename3(dirname5(path))
  };
}
function updateCopilotState(state, entry) {
  const data = record(entry.data);
  if (entry.type === "session.start") {
    state.sessionId = text2(data?.sessionId) ?? state.sessionId;
    state.cliVersion = text2(data?.copilotVersion) ?? state.cliVersion;
    state.cwd = text2(data?.contextCwd) ?? state.cwd;
    state.gitBranch = text2(data?.gitBranch) ?? state.gitBranch;
    return [];
  }
  if (entry.type !== "session.shutdown") {
    return [];
  }
  const occurredAt = text2(entry.timestamp);
  const nativeId = text2(entry.id);
  const metrics = record(data?.modelMetrics);
  if (!(occurredAt && nativeId && metrics)) {
    return [];
  }
  const models = Object.keys(metrics).sort();
  const events = [];
  for (const [index, model] of models.entries()) {
    const rawUsage = usage(metrics[model]);
    if (!rawUsage) {
      continue;
    }
    const diff = delta(rawUsage, state.previous[model]);
    state.previous[model] = rawUsage;
    const cacheRead = diff.cacheReadTokens;
    const cacheWrite = diff.cacheWriteTokens;
    const input = Math.max(0, diff.inputTokens - cacheRead - cacheWrite);
    const output = diff.outputTokens;
    if (input + output + cacheRead + cacheWrite === 0) {
      continue;
    }
    events.push({
      eventId: eventId(
        COPILOT,
        state.sessionId,
        models.length === 1 ? nativeId : `${nativeId}:${index}`
      ),
      harness: COPILOT,
      harnessVersion: state.cliVersion,
      model: { family: modelFamily(model), provider: "github", raw: model },
      occurredAt,
      project: projectRef(state.cwd, state.gitBranch),
      sessionId: state.sessionId,
      tokens: {
        cacheRead,
        cacheWrite,
        input,
        output,
        ...diff.reasoningTokens > 0 ? { reasoning: diff.reasoningTokens } : {}
      },
      type: "usage"
    });
  }
  return events;
}
function listCopilotSessions(home = copilotHome()) {
  const root = join8(home, "session-state");
  if (!existsSync9(root)) {
    return [];
  }
  let dirs;
  try {
    dirs = readdirSync3(root);
  } catch {
    return [];
  }
  return dirs.map((name) => join8(root, name, EVENTS_FILE)).filter((path) => existsSync9(path));
}
async function* collectCopilot(files, ctx) {
  for (const path of files) {
    let stat;
    try {
      stat = statSync5(path);
    } catch {
      continue;
    }
    const previous = ctx.cursors.get(path);
    if (previous && previous.mtimeMs === stat.mtimeMs) {
      continue;
    }
    const state = previous?.copilotState ?? initialCopilotState(path);
    let result;
    try {
      result = tailJsonl(path, ctx.cursors);
    } catch (error) {
      ctx.log(`copilot: cannot tail ${path}: ${String(error)}`);
      continue;
    }
    const announced = new Set(result.cursor.seenSessions || []);
    for (const line of result.lines) {
      const row = parseJsonLine(line);
      const parsed = record(row);
      if (!parsed) {
        continue;
      }
      for (const event of updateCopilotState(state, parsed)) {
        if (ctx.since && Date.parse(event.occurredAt) < ctx.since) {
          continue;
        }
        if (!announced.has(event.sessionId)) {
          announced.add(event.sessionId);
          yield {
            eventId: eventId(COPILOT, event.sessionId, "start"),
            harness: COPILOT,
            occurredAt: event.occurredAt,
            project: event.project,
            sessionId: event.sessionId,
            type: "session.start"
          };
        }
        yield event;
      }
    }
    ctx.cursors.set(path, {
      ...result.cursor,
      copilotState: state,
      seenSessions: [...announced]
    });
  }
}
var copilotCollector = {
  id: COPILOT,
  name: "GitHub Copilot",
  discover: () => {
    const files = listCopilotSessions();
    return Promise.resolve(files.length > 0 ? [copilotHome()] : []);
  },
  collect: (ctx) => collectCopilot(listCopilotSessions(), ctx)
};

// src/collectors/gemini-cli.ts
import { existsSync as existsSync10, readdirSync as readdirSync4, statSync as statSync6 } from "node:fs";
import { homedir as homedir7 } from "node:os";
import { basename as basename4, join as join9 } from "node:path";
var GEMINI_CLI = "gemini-cli";
var JSONL_EXTENSION = /\.jsonl$/;
var SESSION_FILE_NAME = /^session-.*-([A-Za-z0-9_-]{8})$/;
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
function isMetadata(value) {
  return isRecord(value) && typeof value.sessionId === "string" && value.id === void 0;
}
function isMessage(value) {
  return isRecord(value) && typeof value.id === "string" && typeof value.timestamp === "string" && typeof value.type === "string";
}
function sessionIdFromName(path) {
  const name = basename4(path).replace(JSONL_EXTENSION, "");
  const match = SESSION_FILE_NAME.exec(name);
  return match?.[1] ?? name;
}
function count2(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
}
function normalizeGeminiCli(value, state, fallbackSessionId) {
  if (isMetadata(value)) {
    state.sessionId = value.sessionId;
    const dir = value.directories?.find((d) => typeof d === "string");
    if (dir) {
      state.cwd = dir;
    }
    return null;
  }
  if (!isMessage(value) || value.type !== "gemini" || !value.tokens) {
    return null;
  }
  const occurred = Date.parse(value.timestamp);
  if (Number.isNaN(occurred)) {
    return null;
  }
  const prompt = count2(value.tokens.input);
  const cacheRead = count2(value.tokens.cached);
  const input = Math.max(0, prompt - cacheRead);
  const reasoning = count2(value.tokens.thoughts);
  const output = outputWithReasoning({
    output: count2(value.tokens.output),
    prompt,
    reasoning,
    separateByDefault: true,
    total: value.tokens.total === void 0 ? void 0 : count2(value.tokens.total)
  });
  if (input + output + cacheRead === 0) {
    return null;
  }
  const model = value.model ?? "unknown";
  const sessionId = state.sessionId ?? fallbackSessionId;
  return {
    eventId: eventId(GEMINI_CLI, sessionId, value.id),
    harness: GEMINI_CLI,
    model: { family: modelFamily(model), provider: "google", raw: model },
    occurredAt: new Date(occurred).toISOString(),
    project: projectRef(state.cwd),
    sessionId,
    tokens: {
      cacheRead,
      cacheWrite: 0,
      input,
      output,
      ...reasoning > 0 ? { reasoning } : {}
    },
    type: "usage"
  };
}
function geminiCliHome() {
  return process.env.GEMINI_CLI_HOME?.trim() || join9(homedir7(), ".gemini");
}
function listGeminiChats(home = geminiCliHome()) {
  const tmp = join9(home, "tmp");
  if (!existsSync10(tmp)) {
    return [];
  }
  const files = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync4(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join9(dir, entry);
      let stat;
      try {
        stat = statSync6(full);
      } catch {
        continue;
      }
      if (stat.isDirectory()) {
        walk(full);
      } else if (entry.endsWith(".jsonl")) {
        files.push(full);
      }
    }
  };
  walk(tmp);
  return files;
}
async function* collectGeminiCli(files, ctx) {
  const seenEvents = /* @__PURE__ */ new Set();
  for (const path of files) {
    let stat;
    try {
      stat = statSync6(path);
    } catch {
      continue;
    }
    const previous = ctx.cursors.get(path);
    if (previous && previous.mtimeMs === stat.mtimeMs) {
      continue;
    }
    const fallbackId = sessionIdFromName(path);
    const state = {
      cwd: previous?.geminiCwd,
      sessionId: previous?.geminiSessionId
    };
    let result;
    try {
      result = tailJsonl(path, ctx.cursors);
    } catch (error) {
      ctx.log(`gemini-cli: cannot tail ${path}: ${String(error)}`);
      continue;
    }
    const announced = new Set(result.cursor.seenSessions || []);
    for (const line of result.lines) {
      const row = parseJsonLine(line);
      const event = normalizeGeminiCli(row, state, fallbackId);
      if (!event || seenEvents.has(event.eventId)) {
        continue;
      }
      if (ctx.since && Date.parse(event.occurredAt) < ctx.since) {
        continue;
      }
      seenEvents.add(event.eventId);
      if (!announced.has(event.sessionId)) {
        announced.add(event.sessionId);
        yield {
          eventId: eventId(GEMINI_CLI, event.sessionId, "start"),
          harness: GEMINI_CLI,
          occurredAt: event.occurredAt,
          project: event.project,
          sessionId: event.sessionId,
          type: "session.start"
        };
      }
      yield event;
    }
    ctx.cursors.set(path, {
      ...result.cursor,
      geminiCwd: state.cwd,
      geminiSessionId: state.sessionId,
      seenSessions: [...announced]
    });
  }
}
var geminiCliCollector = {
  id: GEMINI_CLI,
  name: "Gemini CLI",
  discover: () => {
    const files = listGeminiChats();
    return Promise.resolve(files.length > 0 ? [geminiCliHome()] : []);
  },
  collect: (ctx) => collectGeminiCli(listGeminiChats(), ctx)
};

// src/collectors/codex.ts
import { existsSync as existsSync11, readdirSync as readdirSync5, statSync as statSync7 } from "node:fs";
import { homedir as homedir8 } from "node:os";
import { join as join10 } from "node:path";
var CODEX = "codex";
function codexHome() {
  return process.env.CODEX_HOME?.trim() || join10(homedir8(), ".codex");
}
function listCodexRollouts(home = codexHome()) {
  const sessions = join10(home, "sessions");
  if (!existsSync11(sessions)) {
    return [];
  }
  const files = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync5(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join10(dir, entry);
      let stat;
      try {
        stat = statSync7(full);
      } catch {
        continue;
      }
      if (stat.isDirectory()) {
        walk(full);
      } else if (entry.startsWith("rollout-") && entry.endsWith(".jsonl")) {
        files.push(full);
      }
    }
  };
  walk(sessions);
  return files;
}
function normalizeCodexLine(row, lineIndex, sessionMeta) {
  if (typeof row !== "object" || row === null) {
    return null;
  }
  const line = row;
  if (line.type === "session_meta" && line.payload) {
    if (typeof line.payload.session_id === "string") {
      sessionMeta.sessionId = line.payload.session_id;
    }
    if (typeof line.payload.cwd === "string") {
      sessionMeta.cwd = line.payload.cwd;
    }
    if (typeof line.payload.cli_version === "string") {
      sessionMeta.version = line.payload.cli_version;
    }
    return null;
  }
  if (line.type === "turn_context" && line.payload) {
    if (typeof line.payload.model === "string") {
      sessionMeta.model = line.payload.model;
    }
    return null;
  }
  if (line.type !== "event_msg" || !line.payload || line.payload.type !== "token_count") {
    return null;
  }
  const payload = line.payload;
  const lastUsage = payload.last_token_usage || {};
  const inputTotal = typeof lastUsage.input_tokens === "number" ? lastUsage.input_tokens : 0;
  const cachedInput = typeof lastUsage.cached_input_tokens === "number" ? lastUsage.cached_input_tokens : 0;
  const input = Math.max(0, inputTotal - cachedInput);
  const output = typeof payload.output_tokens === "number" ? payload.output_tokens : 0;
  const cacheWrite = typeof lastUsage.cache_write_input_tokens === "number" ? lastUsage.cache_write_input_tokens : 0;
  const reasoning = typeof payload.reasoning_output_tokens === "number" ? payload.reasoning_output_tokens : 0;
  if (input + output + cachedInput + cacheWrite === 0) {
    return null;
  }
  const occurredAt = line.timestamp ? new Date(line.timestamp).toISOString() : (/* @__PURE__ */ new Date()).toISOString();
  const sessionId = sessionMeta.sessionId || "unknown-codex";
  const model = sessionMeta.model || "codex";
  return {
    eventId: eventId(CODEX, sessionId, lineIndex),
    harness: CODEX,
    harnessVersion: sessionMeta.version,
    model: { family: modelFamily(model), provider: "openai", raw: model },
    occurredAt,
    project: projectRef(sessionMeta.cwd),
    sessionId,
    tokens: {
      cacheRead: cachedInput,
      cacheWrite,
      input,
      output,
      ...reasoning > 0 ? { reasoning } : {}
    },
    type: "usage"
  };
}
async function* collectCodex(files, ctx) {
  for (const path of files) {
    let stat;
    try {
      stat = statSync7(path);
    } catch {
      continue;
    }
    const previous = ctx.cursors.get(path);
    if (previous && previous.mtimeMs === stat.mtimeMs) {
      continue;
    }
    const sessionMeta = {
      sessionId: previous?.sessionId,
      cwd: previous?.cwd,
      model: previous?.model,
      version: previous?.version
    };
    let result;
    try {
      result = tailJsonl(path, ctx.cursors);
    } catch (error) {
      ctx.log(`codex: cannot tail ${path}: ${String(error)}`);
      continue;
    }
    let idx = previous?.lastLineIdx || 0;
    for (const line of result.lines) {
      idx++;
      const row = parseJsonLine(line);
      const event = normalizeCodexLine(row, idx, sessionMeta);
      if (!event) {
        continue;
      }
      if (ctx.since && Date.parse(event.occurredAt) < ctx.since) {
        continue;
      }
      yield event;
    }
    ctx.cursors.set(path, {
      ...result.cursor,
      lastLineIdx: idx,
      sessionId: sessionMeta.sessionId,
      cwd: sessionMeta.cwd,
      model: sessionMeta.model,
      version: sessionMeta.version
    });
  }
}
var codexCollector = {
  id: CODEX,
  name: "Codex",
  discover: () => {
    const files = listCodexRollouts();
    return Promise.resolve(files.length > 0 ? [codexHome()] : []);
  },
  collect: (ctx) => collectCodex(listCodexRollouts(), ctx)
};

// src/collectors/cline.ts
import { existsSync as existsSync12, readdirSync as readdirSync6, readFileSync as readFileSync5, statSync as statSync8 } from "node:fs";
import { homedir as homedir9 } from "node:os";
import { join as join11 } from "node:path";
var CLINE = "cline";
function normalizeCline(task, afterTs) {
  const events = [];
  let mark = afterTs;
  if (!Array.isArray(task.messages)) {
    return { events, mark };
  }
  const models = (task.metadata?.model_usage ?? []).filter((m) => typeof m.model_id === "string").sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0));
  const modelAt = (ts) => models.findLast((model) => (model.ts ?? 0) <= ts) ?? models[0];
  const cwd = task.metadata?.cwdOnTaskInitialization;
  const sorted = task.messages.filter(
    (m) => m?.type === "say" && m.say === "api_req_started" && typeof m.ts === "number"
  ).sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0));
  for (const message of sorted) {
    const ts = message.ts ?? 0;
    if (ts <= afterTs) {
      continue;
    }
    let req;
    try {
      req = JSON.parse(message.text ?? "{}");
    } catch {
      continue;
    }
    if (typeof req.tokensIn !== "number" && typeof req.tokensOut !== "number") {
      continue;
    }
    const model = modelAt(ts);
    const raw = model?.model_id ?? "unknown";
    events.push({
      eventId: eventId(CLINE, task.taskId, ts),
      harness: CLINE,
      model: {
        family: modelFamily(raw),
        provider: model?.model_provider_id,
        raw
      },
      occurredAt: new Date(ts).toISOString(),
      project: projectRef(cwd),
      sessionId: task.taskId,
      tokens: {
        cacheRead: req.cacheReads ?? 0,
        cacheWrite: req.cacheWrites ?? 0,
        input: req.tokensIn ?? 0,
        output: req.tokensOut ?? 0
      },
      type: "usage",
      ...typeof req.cost === "number" && req.cost > 0 ? { costUsd: req.cost } : {}
    });
    mark = Math.max(mark, ts);
  }
  return { events, mark };
}
function clineStorageDirs(home = homedir9()) {
  const isMac = process.platform === "darwin";
  const vscodeDir = isMac ? join11(home, "Library", "Application Support", "Code", "User", "globalStorage") : join11(home, ".config", "Code", "User", "globalStorage");
  const candidates = [
    join11(vscodeDir, "saoudrizwan.claude-dev", "tasks"),
    join11(vscodeDir, "rooveterinaryinc.roo-cline", "tasks")
  ];
  return candidates.filter((p) => {
    try {
      return statSync8(p).isDirectory();
    } catch {
      return false;
    }
  });
}
async function* collectCline(taskDirs, ctx) {
  for (const root of taskDirs) {
    let taskIds;
    try {
      taskIds = readdirSync6(root);
    } catch {
      continue;
    }
    for (const taskId of taskIds) {
      const taskFolder = join11(root, taskId);
      const msgFile = join11(taskFolder, "ui_messages.json");
      if (!existsSync12(msgFile)) {
        continue;
      }
      let stat;
      try {
        stat = statSync8(msgFile);
      } catch {
        continue;
      }
      const previous = ctx.cursors.get(msgFile);
      if (previous && previous.mtimeMs === stat.mtimeMs) {
        continue;
      }
      let rawMessages;
      try {
        rawMessages = JSON.parse(readFileSync5(msgFile, "utf8"));
      } catch {
        continue;
      }
      const metadata = readJsonFile(join11(taskFolder, "task_metadata.json"));
      const mark = typeof previous?.mark === "number" ? previous.mark : 0;
      const { events, mark: nextMark } = normalizeCline(
        { taskId, messages: rawMessages, metadata },
        mark
      );
      for (const ev of events) {
        if (ctx.since && Date.parse(ev.occurredAt) < ctx.since) {
          continue;
        }
        yield ev;
      }
      ctx.cursors.set(msgFile, {
        mark: nextMark,
        mtimeMs: stat.mtimeMs
      });
    }
  }
}
var clineCollector = {
  id: CLINE,
  name: "Cline",
  discover: () => {
    const dirs = clineStorageDirs();
    return Promise.resolve(dirs);
  },
  collect: (ctx) => collectCline(clineStorageDirs(), ctx)
};

// src/collectors/devin.ts
import { existsSync as existsSync13 } from "node:fs";
import { homedir as homedir10 } from "node:os";
import { join as join12 } from "node:path";
var DEVIN = "devin";
function normalizeDevin(row, session) {
  let parsed;
  try {
    parsed = JSON.parse(row.chat_message);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return null;
  }
  const message = parsed;
  const metrics = message.metadata?.metrics;
  if (message.role !== "assistant" || !metrics || !message.message_id) {
    return null;
  }
  const input = metrics.input_tokens ?? 0;
  const output = metrics.output_tokens ?? 0;
  const cacheRead = metrics.cache_read_tokens ?? 0;
  const cacheWrite = metrics.cache_creation_tokens ?? 0;
  if (input + output + cacheRead + cacheWrite === 0) {
    return null;
  }
  const occurred = new Date(row.created_at * 1e3);
  if (!Number.isFinite(occurred.getTime())) {
    return null;
  }
  const model = session?.model || "unknown";
  return {
    eventId: eventId(DEVIN, row.session_id, message.message_id),
    harness: DEVIN,
    model: {
      family: modelFamily(model),
      provider: session?.backend_type || void 0,
      raw: model
    },
    occurredAt: occurred.toISOString(),
    project: projectRef(session?.working_directory || void 0),
    sessionId: row.session_id,
    tokens: { cacheRead, cacheWrite, input, output },
    type: "usage"
  };
}
function devinDbPath() {
  if (process.env.AI_REPORTER_DEVIN_DB?.trim()) {
    return process.env.AI_REPORTER_DEVIN_DB.trim();
  }
  const data = process.env.XDG_DATA_HOME?.trim() || join12(homedir10(), ".local", "share");
  return join12(data, "devin", "cli", "sessions.db");
}
async function* collectDevin(dbPath2, ctx) {
  if (!existsSync13(dbPath2)) {
    return;
  }
  const mtimeMs = lastWriteMs(dbPath2);
  const previous = ctx.cursors.get(dbPath2);
  if (previous && previous.mtimeMs === mtimeMs) {
    return;
  }
  let mark = typeof previous?.mark === "number" ? previous.mark : 0;
  let db;
  let sessions = /* @__PURE__ */ new Map();
  let rows;
  try {
    db = openReadOnly(dbPath2);
    const sessionRows = db.prepare(
      "SELECT id, working_directory, backend_type, model FROM sessions"
    ).all();
    for (const s of sessionRows) {
      sessions.set(s.id, s);
    }
    rows = db.prepare(
      "SELECT rowid as row_id, session_id, created_at, chat_message FROM message_nodes WHERE rowid > ? ORDER BY rowid ASC"
    ).all(mark);
  } catch (error) {
    ctx.log(`devin: cannot read ${dbPath2}: ${String(error)}`);
    return;
  } finally {
    db?.close();
  }
  const seenMessages = /* @__PURE__ */ new Set();
  for (const row of rows) {
    mark = Math.max(mark, row.row_id);
    const session = sessions.get(row.session_id);
    const event = normalizeDevin(row, session);
    if (!event || seenMessages.has(event.eventId)) {
      continue;
    }
    if (ctx.since && Date.parse(event.occurredAt) < ctx.since) {
      continue;
    }
    seenMessages.add(event.eventId);
    yield event;
  }
  ctx.cursors.set(dbPath2, {
    mark,
    mtimeMs,
    offset: 0
  });
}
var devinCollector = {
  id: DEVIN,
  name: "Devin",
  discover: () => {
    const p = devinDbPath();
    return Promise.resolve(existsSync13(p) ? [p] : []);
  },
  collect: (ctx) => collectDevin(devinDbPath(), ctx)
};

// src/collectors/pi.ts
import { existsSync as existsSync14, readdirSync as readdirSync7, statSync as statSync9 } from "node:fs";
import { homedir as homedir11 } from "node:os";
import { join as join13 } from "node:path";
var PI = "pi";
var OMP = "omp";
function record2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value : void 0;
}
function count3(value) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : void 0;
}
function normalizePi(value, state, harness) {
  const entry = record2(value);
  if (!entry) {
    return null;
  }
  if (entry.type === "session") {
    state.sessionId = typeof entry.id === "string" ? entry.id : void 0;
    state.project = projectRef(
      typeof entry.cwd === "string" ? entry.cwd : void 0
    );
    return null;
  }
  const message = record2(entry.message);
  const usage2 = record2(message?.usage);
  if (entry.type !== "message" || typeof entry.id !== "string" || !entry.id || typeof entry.timestamp !== "string" || !state.sessionId || message?.role !== "assistant" || typeof message.model !== "string" || !message.model || !usage2) {
    return null;
  }
  const occurred = Date.parse(entry.timestamp);
  const input = count3(usage2.input);
  const output = count3(usage2.output);
  const cacheRead = count3(usage2.cacheRead);
  const cacheWrite = count3(usage2.cacheWrite);
  if (Number.isNaN(occurred) || input === void 0 || output === void 0 || cacheRead === void 0 || cacheWrite === void 0 || input + output + cacheRead + cacheWrite === 0) {
    return null;
  }
  const reasoning = count3(
    harness === PI ? usage2.reasoning : usage2.reasoningTokens
  );
  const cost = record2(usage2.cost)?.total;
  return {
    costUsd: typeof cost === "number" && Number.isFinite(cost) && cost >= 0 ? cost : void 0,
    eventId: eventId(harness, state.sessionId, entry.id),
    harness,
    model: {
      family: modelFamily(message.model),
      provider: typeof message.provider === "string" ? message.provider : void 0,
      raw: message.model
    },
    occurredAt: new Date(occurred).toISOString(),
    project: state.project,
    sessionId: state.sessionId,
    tokens: {
      cacheRead,
      cacheWrite,
      input,
      output,
      ...reasoning !== void 0 ? { reasoning } : {}
    },
    type: "usage"
  };
}
function listSessions(dir) {
  if (!existsSync14(dir)) {
    return [];
  }
  const files = [];
  const walk = (d) => {
    let entries;
    try {
      entries = readdirSync7(d);
    } catch {
      return;
    }
    for (const e of entries) {
      const full = join13(d, e);
      let s;
      try {
        s = statSync9(full);
      } catch {
        continue;
      }
      if (s.isDirectory()) {
        walk(full);
      } else if (e.endsWith(".jsonl")) {
        files.push(full);
      }
    }
  };
  walk(dir);
  return files;
}
async function* collectPiLike(harness, sessionsDir, ctx) {
  const files = listSessions(sessionsDir);
  for (const path of files) {
    let stat;
    try {
      stat = statSync9(path);
    } catch {
      continue;
    }
    const previous = ctx.cursors.get(path);
    if (previous && previous.mtimeMs === stat.mtimeMs) {
      continue;
    }
    const state = {
      project: previous?.project,
      sessionId: previous?.sessionId
    };
    let result;
    try {
      result = tailJsonl(path, ctx.cursors);
    } catch (error) {
      ctx.log(`${harness}: cannot tail ${path}: ${String(error)}`);
      continue;
    }
    for (const line of result.lines) {
      const row = parseJsonLine(line);
      const event = normalizePi(row, state, harness);
      if (!event) {
        continue;
      }
      if (ctx.since && Date.parse(event.occurredAt) < ctx.since) {
        continue;
      }
      yield event;
    }
    ctx.cursors.set(path, {
      ...result.cursor,
      project: state.project,
      sessionId: state.sessionId
    });
  }
}
function piSessionsDir(home = homedir11()) {
  return join13(home, ".pi", "agent", "sessions");
}
function ompSessionsDir(home = homedir11()) {
  return join13(home, ".omp", "agent", "sessions");
}
var piCollector = {
  id: PI,
  name: "Pi",
  discover: () => {
    const d = piSessionsDir();
    return Promise.resolve(existsSync14(d) ? [d] : []);
  },
  collect: (ctx) => collectPiLike(PI, piSessionsDir(), ctx)
};
var ompCollector = {
  id: OMP,
  name: "Oh My Pi",
  discover: () => {
    const d = ompSessionsDir();
    return Promise.resolve(existsSync14(d) ? [d] : []);
  },
  collect: (ctx) => collectPiLike(OMP, ompSessionsDir(), ctx)
};

// src/collectors/qwen-code.ts
import { existsSync as existsSync15, readdirSync as readdirSync8, statSync as statSync10 } from "node:fs";
import { homedir as homedir12 } from "node:os";
import { join as join14 } from "node:path";
var QWEN_CODE = "qwen-code";
function isQwenLine(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const v = value;
  return typeof v.uuid === "string" && typeof v.sessionId === "string" && typeof v.timestamp === "string" && typeof v.type === "string";
}
function count4(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
}
function normalizeQwenCode(value) {
  if (!isQwenLine(value) || value.type !== "assistant" || !value.usageMetadata) {
    return null;
  }
  const occurred = Date.parse(value.timestamp);
  if (Number.isNaN(occurred)) {
    return null;
  }
  const u = value.usageMetadata;
  const prompt = count4(u.promptTokenCount);
  const cached = Math.min(count4(u.cachedContentTokenCount), prompt);
  const reasoning = count4(u.thoughtsTokenCount);
  const output = outputWithReasoning({
    output: count4(u.candidatesTokenCount),
    prompt,
    reasoning,
    separateByDefault: false,
    total: count4(u.totalTokenCount)
  });
  if (prompt === 0 && output === 0 && count4(u.totalTokenCount) === 0) {
    return null;
  }
  const model = value.model ?? "qwen";
  return {
    eventId: eventId(QWEN_CODE, value.sessionId, value.uuid),
    harness: QWEN_CODE,
    harnessVersion: value.version === "unknown" ? void 0 : value.version,
    model: { family: modelFamily(model), provider: "alibaba", raw: model },
    occurredAt: new Date(occurred).toISOString(),
    project: projectRef(value.cwd, value.gitBranch),
    sessionId: value.sessionId,
    tokens: {
      cacheRead: cached,
      cacheWrite: 0,
      input: Math.max(0, prompt - cached),
      output,
      ...reasoning > 0 ? { reasoning } : {}
    },
    type: "usage"
  };
}
function qwenHome() {
  return process.env.QWEN_HOME?.trim() || join14(homedir12(), ".qwen");
}
function listQwenChats(home = qwenHome()) {
  const projects = join14(home, "projects");
  if (!existsSync15(projects)) {
    return [];
  }
  const files = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync8(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join14(dir, entry);
      let stat;
      try {
        stat = statSync10(full);
      } catch {
        continue;
      }
      if (stat.isDirectory()) {
        walk(full);
      } else if (entry.endsWith(".jsonl")) {
        files.push(full);
      }
    }
  };
  walk(projects);
  return files;
}
async function* collectQwenCode(files, ctx) {
  for (const path of files) {
    let stat;
    try {
      stat = statSync10(path);
    } catch {
      continue;
    }
    const previous = ctx.cursors.get(path);
    if (previous && previous.mtimeMs === stat.mtimeMs) {
      continue;
    }
    let result;
    try {
      result = tailJsonl(path, ctx.cursors);
    } catch (error) {
      ctx.log(`qwen-code: cannot tail ${path}: ${String(error)}`);
      continue;
    }
    for (const line of result.lines) {
      const row = parseJsonLine(line);
      const event = normalizeQwenCode(row);
      if (!event) {
        continue;
      }
      if (ctx.since && Date.parse(event.occurredAt) < ctx.since) {
        continue;
      }
      yield event;
    }
    ctx.cursors.set(path, result.cursor);
  }
}
var qwenCodeCollector = {
  id: QWEN_CODE,
  name: "Qwen Code",
  discover: () => {
    const files = listQwenChats();
    return Promise.resolve(files.length > 0 ? [qwenHome()] : []);
  },
  collect: (ctx) => collectQwenCode(listQwenChats(), ctx)
};

// src/collectors/kilo-code.ts
import { existsSync as existsSync16, readdirSync as readdirSync9 } from "node:fs";
import { homedir as homedir13 } from "node:os";
import { join as join15 } from "node:path";
var KILO_CODE = "kilo-code";
var DB_NAME = /^(kilo|opencode)(-[A-Za-z0-9._-]+)?\.db$/;
function kiloDataDir() {
  const data = process.env.XDG_DATA_HOME?.trim() || join15(homedir13(), ".local", "share");
  return join15(data, "kilo");
}
function kiloDbPaths(dir = kiloDataDir()) {
  if (!existsSync16(dir)) {
    return [];
  }
  return readdirSync9(dir).filter((name) => DB_NAME.test(name)).sort().map((name) => join15(dir, name));
}
var kiloCodeCollector = {
  id: KILO_CODE,
  name: "Kilo Code",
  discover: () => Promise.resolve(kiloDbPaths()),
  collect: async function* (ctx) {
    const paths = kiloDbPaths();
    for (const p of paths) {
      yield* collectOpenCodeFromDb(p, ctx, KILO_CODE);
    }
  }
};

// src/collectors/index.ts
var ALL_COLLECTORS = [
  antigravityCollector,
  claudeCodeCollector,
  cursorCollector,
  openCodeCollector,
  copilotCollector,
  geminiCliCollector,
  codexCollector,
  clineCollector,
  devinCollector,
  piCollector,
  ompCollector,
  qwenCodeCollector,
  kiloCodeCollector
];

// src/storage/db.ts
import { DatabaseSync as DatabaseSync2 } from "node:sqlite";
import { dirname as dirname6 } from "node:path";
var ReporterDatabase = class {
  db;
  constructor(customPath) {
    const path = customPath || dbPath();
    ensureDir(dirname6(path));
    this.db = new DatabaseSync2(path);
    this.init();
  }
  init() {
    this.db.exec("PRAGMA journal_mode = WAL;");
    this.db.exec("PRAGMA synchronous = NORMAL;");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        eventId TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        occurredAt TEXT NOT NULL,
        observedAt TEXT NOT NULL,
        harness TEXT NOT NULL,
        harnessVersion TEXT,
        sessionId TEXT NOT NULL,
        projectName TEXT,
        projectDirHash TEXT,
        gitBranch TEXT,
        repo TEXT,
        modelRaw TEXT NOT NULL,
        modelName TEXT NOT NULL,
        modelFamily TEXT NOT NULL,
        modelProvider TEXT NOT NULL,
        tokensInput INTEGER NOT NULL DEFAULT 0,
        tokensOutput INTEGER NOT NULL DEFAULT 0,
        tokensCacheRead INTEGER NOT NULL DEFAULT 0,
        tokensCacheWrite INTEGER NOT NULL DEFAULT 0,
        tokensReasoning INTEGER NOT NULL DEFAULT 0,
        tokensTotal INTEGER NOT NULL DEFAULT 0,
        costUsd REAL NOT NULL DEFAULT 0,
        costSavingsUsd REAL NOT NULL DEFAULT 0,
        nativeRequestId TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_events_occurredAt ON events(occurredAt);
      CREATE INDEX IF NOT EXISTS idx_events_harness ON events(harness);
      CREATE INDEX IF NOT EXISTS idx_events_modelName ON events(modelName);
      CREATE INDEX IF NOT EXISTS idx_events_projectName ON events(projectName);

      CREATE TABLE IF NOT EXISTS cursors (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);
  }
  insertEvents(events) {
    if (events.length === 0) {
      return 0;
    }
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO events (
        eventId, type, occurredAt, observedAt, harness, harnessVersion,
        sessionId, projectName, projectDirHash, gitBranch, repo,
        modelRaw, modelName, modelFamily, modelProvider,
        tokensInput, tokensOutput, tokensCacheRead, tokensCacheWrite, tokensReasoning, tokensTotal,
        costUsd, costSavingsUsd, nativeRequestId
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?
      )
    `);
    let inserted = 0;
    this.db.exec("BEGIN TRANSACTION;");
    try {
      for (const ev of events) {
        const changes = stmt.run(
          ev.eventId,
          ev.type,
          ev.occurredAt,
          ev.observedAt,
          ev.harness,
          ev.harnessVersion || null,
          ev.sessionId,
          ev.project?.name || null,
          ev.project?.dirHash || null,
          ev.project?.gitBranch || null,
          ev.project?.repo || null,
          ev.model.raw,
          ev.model.name,
          ev.model.family,
          ev.model.provider,
          ev.tokens.input,
          ev.tokens.output,
          ev.tokens.cacheRead,
          ev.tokens.cacheWrite,
          ev.tokens.reasoning || 0,
          ev.tokens.total,
          ev.costUsd,
          ev.costSavingsUsd,
          ev.native?.requestId || null
        ).changes;
        if (Number(changes) > 0) {
          inserted++;
        }
      }
      this.db.exec("COMMIT;");
    } catch (e) {
      this.db.exec("ROLLBACK;");
      throw e;
    }
    return inserted;
  }
  getSummary(options) {
    const conditions = ["type = 'usage'"];
    const params = [];
    if (options?.since) {
      conditions.push("occurredAt >= ?");
      params.push(options.since);
    }
    if (options?.until) {
      conditions.push("occurredAt <= ?");
      params.push(options.until);
    }
    if (options?.harness) {
      conditions.push("harness = ?");
      params.push(options.harness);
    }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const query = `
      SELECT
        COUNT(*) as totalRequests,
        COUNT(DISTINCT sessionId) as totalSessions,
        COALESCE(SUM(tokensTotal), 0) as totalTokens,
        COALESCE(SUM(tokensInput), 0) as inputTokens,
        COALESCE(SUM(tokensOutput), 0) as outputTokens,
        COALESCE(SUM(tokensCacheRead), 0) as cacheReadTokens,
        COALESCE(SUM(tokensCacheWrite), 0) as cacheWriteTokens,
        COALESCE(SUM(tokensReasoning), 0) as reasoningTokens,
        COALESCE(SUM(costUsd), 0) as totalCostUsd,
        COALESCE(SUM(costSavingsUsd), 0) as totalCostSavingsUsd,
        MIN(occurredAt) as firstEventAt,
        MAX(occurredAt) as lastEventAt
      FROM events
      ${where}
    `;
    const row = this.db.prepare(query).get(...params);
    return {
      totalRequests: Number(row.totalRequests) || 0,
      totalSessions: Number(row.totalSessions) || 0,
      totalTokens: Number(row.totalTokens) || 0,
      inputTokens: Number(row.inputTokens) || 0,
      outputTokens: Number(row.outputTokens) || 0,
      cacheReadTokens: Number(row.cacheReadTokens) || 0,
      cacheWriteTokens: Number(row.cacheWriteTokens) || 0,
      reasoningTokens: Number(row.reasoningTokens) || 0,
      totalCostUsd: Math.round((Number(row.totalCostUsd) || 0) * 1e3) / 1e3,
      totalCostSavingsUsd: Math.round((Number(row.totalCostSavingsUsd) || 0) * 1e3) / 1e3,
      firstEventAt: row.firstEventAt || void 0,
      lastEventAt: row.lastEventAt || void 0
    };
  }
  getHarnessSummaries(options) {
    const conditions = ["type = 'usage'"];
    const params = [];
    if (options?.since) {
      conditions.push("occurredAt >= ?");
      params.push(options.since);
    }
    if (options?.until) {
      conditions.push("occurredAt <= ?");
      params.push(options.until);
    }
    const where = `WHERE ${conditions.join(" AND ")}`;
    const query = `
      SELECT
        harness,
        COUNT(*) as requests,
        COALESCE(SUM(tokensTotal), 0) as tokens,
        COALESCE(SUM(tokensInput), 0) as input,
        COALESCE(SUM(tokensOutput), 0) as output,
        COALESCE(SUM(tokensCacheRead + tokensCacheWrite), 0) as cached,
        COALESCE(SUM(costUsd), 0) as costUsd,
        COALESCE(SUM(costSavingsUsd), 0) as costSavingsUsd,
        MAX(occurredAt) as lastEventAt
      FROM events
      ${where}
      GROUP BY harness
      ORDER BY tokens DESC
    `;
    const rows = this.db.prepare(query).all(...params);
    return rows.map((r) => ({
      harness: r.harness,
      requests: Number(r.requests) || 0,
      tokens: Number(r.tokens) || 0,
      input: Number(r.input) || 0,
      output: Number(r.output) || 0,
      cached: Number(r.cached) || 0,
      costUsd: Math.round((Number(r.costUsd) || 0) * 1e3) / 1e3,
      costSavingsUsd: Math.round((Number(r.costSavingsUsd) || 0) * 1e3) / 1e3,
      lastEventAt: r.lastEventAt || void 0
    }));
  }
  getModelSummaries(options) {
    const conditions = ["type = 'usage'"];
    const params = [];
    if (options?.since) {
      conditions.push("occurredAt >= ?");
      params.push(options.since);
    }
    if (options?.until) {
      conditions.push("occurredAt <= ?");
      params.push(options.until);
    }
    const where = `WHERE ${conditions.join(" AND ")}`;
    const limit = options?.limit ?? 15;
    const query = `
      SELECT
        modelName,
        modelFamily,
        COUNT(*) as requests,
        COALESCE(SUM(tokensTotal), 0) as tokens,
        COALESCE(SUM(tokensInput), 0) as input,
        COALESCE(SUM(tokensOutput), 0) as output,
        COALESCE(SUM(tokensCacheRead + tokensCacheWrite), 0) as cached,
        COALESCE(SUM(costUsd), 0) as costUsd
      FROM events
      ${where}
      GROUP BY modelName, modelFamily
      ORDER BY tokens DESC
      LIMIT ?
    `;
    params.push(limit);
    const rows = this.db.prepare(query).all(...params);
    return rows.map((r) => ({
      modelName: r.modelName,
      modelFamily: r.modelFamily,
      requests: Number(r.requests) || 0,
      tokens: Number(r.tokens) || 0,
      input: Number(r.input) || 0,
      output: Number(r.output) || 0,
      cached: Number(r.cached) || 0,
      costUsd: Math.round((Number(r.costUsd) || 0) * 1e3) / 1e3
    }));
  }
  getProjectSummaries(options) {
    const conditions = ["type = 'usage' AND projectName IS NOT NULL"];
    const params = [];
    if (options?.since) {
      conditions.push("occurredAt >= ?");
      params.push(options.since);
    }
    if (options?.until) {
      conditions.push("occurredAt <= ?");
      params.push(options.until);
    }
    const where = `WHERE ${conditions.join(" AND ")}`;
    const limit = options?.limit ?? 10;
    const query = `
      SELECT
        projectName,
        COUNT(*) as requests,
        COALESCE(SUM(tokensTotal), 0) as tokens,
        COALESCE(SUM(costUsd), 0) as costUsd,
        MAX(occurredAt) as lastEventAt
      FROM events
      ${where}
      GROUP BY projectName
      ORDER BY tokens DESC
      LIMIT ?
    `;
    params.push(limit);
    const rows = this.db.prepare(query).all(...params);
    return rows.map((r) => ({
      projectName: r.projectName,
      requests: Number(r.requests) || 0,
      tokens: Number(r.tokens) || 0,
      costUsd: Math.round((Number(r.costUsd) || 0) * 1e3) / 1e3,
      lastEventAt: r.lastEventAt || void 0
    }));
  }
  getDailyUsage(days = 14) {
    const query = `
      SELECT
        substr(occurredAt, 1, 10) as day,
        COUNT(*) as requests,
        COALESCE(SUM(tokensTotal), 0) as tokens,
        COALESCE(SUM(tokensInput), 0) as input,
        COALESCE(SUM(tokensOutput), 0) as output,
        COALESCE(SUM(tokensCacheRead + tokensCacheWrite), 0) as cached,
        COALESCE(SUM(costUsd), 0) as costUsd
      FROM events
      WHERE type = 'usage'
      GROUP BY day
      ORDER BY day DESC
      LIMIT ?
    `;
    const rows = this.db.prepare(query).all(days);
    return rows.map((r) => ({
      day: r.day,
      requests: Number(r.requests) || 0,
      tokens: Number(r.tokens) || 0,
      input: Number(r.input) || 0,
      output: Number(r.output) || 0,
      cached: Number(r.cached) || 0,
      costUsd: Math.round((Number(r.costUsd) || 0) * 1e3) / 1e3
    })).reverse();
  }
  getRecentEvents(options) {
    const conditions = ["type = 'usage'"];
    const params = [];
    if (options?.harness) {
      conditions.push("harness = ?");
      params.push(options.harness);
    }
    if (options?.since) {
      conditions.push("occurredAt >= ?");
      params.push(options.since);
    }
    const limit = options?.limit ?? 50;
    const where = `WHERE ${conditions.join(" AND ")}`;
    const query = `
      SELECT * FROM events
      ${where}
      ORDER BY occurredAt DESC
      LIMIT ?
    `;
    params.push(limit);
    const rows = this.db.prepare(query).all(...params);
    return rows.map((r) => ({
      eventId: r.eventId,
      type: r.type,
      occurredAt: r.occurredAt,
      observedAt: r.observedAt,
      harness: r.harness,
      harnessVersion: r.harnessVersion || void 0,
      sessionId: r.sessionId,
      project: r.projectName ? {
        name: r.projectName,
        dirHash: r.projectDirHash || "",
        gitBranch: r.gitBranch || void 0,
        repo: r.repo || void 0
      } : void 0,
      model: {
        raw: r.modelRaw,
        name: r.modelName,
        family: r.modelFamily,
        provider: r.modelProvider
      },
      tokens: {
        input: Number(r.tokensInput),
        output: Number(r.tokensOutput),
        cacheRead: Number(r.tokensCacheRead),
        cacheWrite: Number(r.tokensCacheWrite),
        reasoning: Number(r.tokensReasoning),
        total: Number(r.tokensTotal)
      },
      costUsd: Number(r.costUsd),
      costSavingsUsd: Number(r.costSavingsUsd),
      native: r.nativeRequestId ? { requestId: r.nativeRequestId } : void 0
    }));
  }
  getCursor(key) {
    const row = this.db.prepare("SELECT value FROM cursors WHERE key = ?").get(key);
    if (!row?.value) {
      return null;
    }
    try {
      return JSON.parse(row.value);
    } catch {
      return null;
    }
  }
  setCursor(key, value) {
    const stmt = this.db.prepare(`
      INSERT INTO cursors (key, value, updatedAt)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt
    `);
    stmt.run(key, JSON.stringify(value), (/* @__PURE__ */ new Date()).toISOString());
  }
  getAllCursors() {
    const map = /* @__PURE__ */ new Map();
    const rows = this.db.prepare("SELECT key, value FROM cursors").all();
    for (const r of rows) {
      try {
        map.set(r.key, JSON.parse(r.value));
      } catch {
      }
    }
    return map;
  }
  saveCursorsBatch(entries) {
    if (entries.length === 0) return;
    const stmt = this.db.prepare(`
      INSERT INTO cursors (key, value, updatedAt)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt
    `);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.db.exec("BEGIN TRANSACTION;");
    try {
      for (const [k, v] of entries) {
        stmt.run(k, JSON.stringify(v), now);
      }
      this.db.exec("COMMIT;");
    } catch (e) {
      this.db.exec("ROLLBACK;");
      throw e;
    }
  }
  close() {
    this.db.close();
  }
};
var defaultDb = null;
function getDatabase() {
  if (!defaultDb) {
    defaultDb = new ReporterDatabase();
  }
  return defaultDb;
}

// src/storage/cursors.ts
var DatabaseCursorStore = class {
  cache = /* @__PURE__ */ new Map();
  dirty = /* @__PURE__ */ new Set();
  constructor() {
    this.reload();
  }
  reload() {
    const existing = getDatabase().getAllCursors();
    this.cache.clear();
    for (const [k, v] of existing.entries()) {
      this.cache.set(k, v);
    }
    this.dirty.clear();
  }
  get(key) {
    return this.cache.get(key);
  }
  set(key, value) {
    this.cache.set(key, value);
    this.dirty.add(key);
  }
  save() {
    if (this.dirty.size === 0) {
      return;
    }
    const entries = [];
    for (const key of this.dirty) {
      entries.push([key, this.cache.get(key)]);
    }
    getDatabase().saveCursorsBatch(entries);
    this.dirty.clear();
  }
};
function openCursorStore() {
  return new DatabaseCursorStore();
}

// src/storage/spool.ts
import { appendFileSync as appendFileSync2, existsSync as existsSync17, readdirSync as readdirSync10, readFileSync as readFileSync6 } from "node:fs";
import { join as join16 } from "node:path";
function writeSpool(events) {
  if (events.length === 0) return;
  const dir = spoolDir();
  ensureDir(dir);
  const byDay = /* @__PURE__ */ new Map();
  for (const ev of events) {
    const day = ev.occurredAt.slice(0, 10);
    const list = byDay.get(day) || [];
    list.push(ev);
    byDay.set(day, list);
  }
  for (const [day, list] of byDay.entries()) {
    const file = join16(dir, `${day}.ndjson`);
    const lines = list.map((e) => JSON.stringify(e)).join("\n") + "\n";
    appendFileSync2(file, lines, { encoding: "utf8", mode: 384 });
  }
}

// src/engine/watcher.ts
var IDLE_AFTER_MS = 10 * 60 * 1e3;
var IDLE_INTERVAL_MS = 60 * 1e3;
var Watcher = class {
  db;
  cursors = openCursorStore();
  baseIntervalMs;
  verbose;
  running = false;
  paused = false;
  stopRequested = false;
  lastActivityAt = Date.now();
  wakeResolver;
  onEvent;
  onScanComplete;
  onLog;
  constructor(options = {}) {
    this.db = getDatabase();
    this.baseIntervalMs = options.intervalMs ?? 3e4;
    this.verbose = Boolean(options.verbose);
    this.onEvent = options.onEvent;
    this.onScanComplete = options.onScanComplete;
    this.onLog = options.onLog ?? (() => {
    });
  }
  log(msg) {
    this.onLog(msg);
  }
  isPaused() {
    return this.paused;
  }
  setPaused(paused) {
    this.paused = paused;
    if (!paused) {
      this.wake();
    }
  }
  togglePause() {
    this.setPaused(!this.paused);
    return this.paused;
  }
  wake() {
    if (this.wakeResolver) {
      const resolve4 = this.wakeResolver;
      this.wakeResolver = void 0;
      resolve4();
    }
  }
  stop() {
    this.stopRequested = true;
    this.wake();
  }
  async scanOnce() {
    const start = Date.now();
    this.cursors.reload?.();
    const result = {
      byHarness: {},
      durationMs: 0,
      failedHarnesses: [],
      totalFound: 0,
      totalNew: 0
    };
    const ctx = {
      cursors: this.cursors,
      log: (msg) => this.log(msg)
    };
    for (const collector of ALL_COLLECTORS) {
      try {
        await collector.prepare?.(ctx.log);
      } catch (e) {
        this.log(`${collector.id}: prepare warning: ${String(e)}`);
      }
    }
    const batch = [];
    for (const collector of ALL_COLLECTORS) {
      try {
        const roots = await collector.discover();
        if (roots.length === 0) {
          continue;
        }
        for await (const raw of collector.collect(ctx)) {
          if (raw.type !== "usage") {
            continue;
          }
          const event = canonicalize(raw);
          const problems = validateEvent(event);
          if (problems.length > 0) {
            this.log(`${collector.id}: dropped invalid event: ${problems.join("; ")}`);
            continue;
          }
          result.totalFound++;
          batch.push(event);
          result.byHarness[collector.id] = (result.byHarness[collector.id] ?? 0) + 1;
        }
      } catch (error) {
        result.failedHarnesses.push(collector.id);
        this.log(`${collector.id}: collection failed: ${String(error)}`);
      }
    }
    if (batch.length > 0) {
      const inserted = this.db.insertEvents(batch);
      result.totalNew = inserted;
      if (inserted > 0) {
        this.lastActivityAt = Date.now();
        writeSpool(batch);
        for (const ev of batch) {
          this.onEvent?.(ev);
        }
      }
    }
    this.cursors.save();
    result.durationMs = Date.now() - start;
    this.onScanComplete?.(result);
    return result;
  }
  currentInterval() {
    const idleTime = Date.now() - this.lastActivityAt;
    if (idleTime >= IDLE_AFTER_MS) {
      return Math.max(this.baseIntervalMs, IDLE_INTERVAL_MS);
    }
    return this.baseIntervalMs;
  }
  async run() {
    if (this.running) {
      return;
    }
    this.running = true;
    this.stopRequested = false;
    try {
      while (!this.stopRequested) {
        if (!this.paused) {
          try {
            await this.scanOnce();
          } catch (err) {
            this.log(`scan error: ${String(err)}`);
          }
        }
        if (this.stopRequested) {
          break;
        }
        const waitMs = this.paused ? 5e3 : this.currentInterval();
        await new Promise((resolve4) => {
          this.wakeResolver = resolve4;
          const timer = setTimeout(() => {
            this.wakeResolver = void 0;
            resolve4();
          }, waitMs);
        });
      }
    } finally {
      this.running = false;
      this.cursors.save();
    }
  }
};

// src/commands/daemon.ts
function registerDaemon(program3) {
  const daemon = program3.command("daemon").description("Internal background daemon runner");
  daemon.command("run").description("Run the continuous 24/7 scanning worker headlessly").option("-i, --interval <seconds>", "seconds between scans", "30").action(async (options) => {
    const intervalMs = Math.max(5, Number(options.interval) || 30) * 1e3;
    let releaseLock;
    try {
      releaseLock = acquireLock();
    } catch (err) {
      console.error(`[daemon] Error acquiring lock: ${err.message}`);
      process.exit(1);
    }
    console.log(`[daemon] AI-Reporter 24/7 worker started (pid: ${process.pid})`);
    const watcher = new Watcher({
      intervalMs,
      onLog: (msg) => {
        console.log(`[daemon] ${msg}`);
      },
      onScanComplete: (res) => {
        if (res.totalNew > 0) {
          console.log(
            `[daemon] Scan finished: ${res.totalNew} new usage records saved in ${res.durationMs}ms`
          );
        }
      }
    });
    const shutdown = () => {
      console.log("[daemon] Shutting down cleanly...");
      watcher.stop();
      releaseLock();
      process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    try {
      await watcher.run();
    } finally {
      releaseLock();
    }
  });
}

// src/commands/export.ts
import { writeFileSync as writeFileSync3 } from "node:fs";

// src/ui/style.ts
var colorEnabled = !process.env.NO_COLOR && process.env.TERM !== "dumb" && (Boolean(process.env.FORCE_COLOR) || Boolean(process.stdout.isTTY));
function wrap(open, close = "\x1B[39m") {
  return (text3) => colorEnabled ? `${open}${text3}${close}` : text3;
}
var rgb = (r, g, b) => `\x1B[38;2;${r};${g};${b}m`;
var c = {
  bold: wrap("\x1B[1m", "\x1B[22m"),
  dim: wrap("\x1B[2m", "\x1B[22m"),
  italic: wrap("\x1B[3m", "\x1B[23m"),
  cyan: wrap("\x1B[36m"),
  green: wrap("\x1B[32m"),
  yellow: wrap("\x1B[33m"),
  blue: wrap("\x1B[34m"),
  magenta: wrap("\x1B[35m"),
  red: wrap("\x1B[31m"),
  gold: wrap(rgb(234, 182, 25)),
  orange: wrap(rgb(217, 107, 42)),
  purple: wrap(rgb(139, 92, 246)),
  teal: wrap(rgb(53, 133, 138)),
  navy: wrap(rgb(143, 184, 209))
};
var BRAND = `${c.cyan("\u2726")} ${c.bold(c.gold("AI-Reporter"))}`;
var ANSI_REGEX = /[\u001B\u009B][[()#;?]*(?:(?:(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d\/#&.:=?%@~_]*)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-ntqry=><~]))/g;
function stripAnsi(text3) {
  return text3.replace(ANSI_REGEX, "");
}
var CONTROL_CHARACTERS = new RegExp("\\p{Cc}", "gu");
var BIDI_CONTROL = new RegExp("\\p{Bidi_Control}", "gu");
var GRAPHEMES = new Intl.Segmenter(void 0, { granularity: "grapheme" });
function width(text3) {
  const clean = stripAnsi(text3);
  let len = 0;
  for (const { segment } of GRAPHEMES.segment(clean)) {
    const code = segment.codePointAt(0) ?? 0;
    if (code >= 4352 && code <= 4447 || code >= 9001 && code <= 9002 || code >= 11904 && code <= 42191 && code !== 12351 || code >= 44032 && code <= 55203 || code >= 63744 && code <= 64255 || code >= 65040 && code <= 65049 || code >= 65072 && code <= 65135 || code >= 65280 && code <= 65376 || code >= 65504 && code <= 65510 || code >= 127744 && code <= 128591 || code >= 129280 && code <= 129535) {
      len += 2;
    } else {
      len += 1;
    }
  }
  return len;
}

// src/ui/tui.ts
var GRAPHEMES2 = new Intl.Segmenter(void 0, { granularity: "grapheme" });
function pad(text3, size) {
  return text3 + " ".repeat(Math.max(0, size - width(text3)));
}
function padLeft(text3, size) {
  return " ".repeat(Math.max(0, size - width(text3))) + text3;
}
function fit(text3, max) {
  if (width(text3) <= max) {
    return text3;
  }
  let out = "";
  for (const { segment: ch } of GRAPHEMES2.segment(stripAnsi(text3))) {
    if (width(`${out}${ch}`) > Math.max(0, max - 1)) {
      break;
    }
    out += ch;
  }
  return `${out}\u2026`;
}
function wrap2(text3, w) {
  const words = text3.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    if (current && width(`${current} ${word}`) > w) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines.length ? lines : [""];
}
var accentPaint = {
  cyan: c.cyan,
  dim: c.dim,
  gold: c.gold,
  green: c.green,
  purple: c.purple,
  teal: c.teal
};
function box(options, lines, w) {
  const inner = Math.max(4, w - 4);
  const border = accentPaint[options.accent ?? "cyan"];
  const title = `${border("\u256D\u2500 ")}${c.bold(options.title)}${border(" ")}`;
  const sub = options.subtitle ? `${c.dim(options.subtitle)}${border(" ")}` : "";
  const filler = Math.max(0, w - width(title) - width(sub) - 1);
  const top = `${title}${border("\u2500".repeat(filler))}${sub}${border("\u256E")}`;
  const rows = options.height === void 0 ? [...lines] : lines.slice(0, options.height);
  while (options.height !== void 0 && rows.length < options.height) {
    rows.push("");
  }
  const body = rows.map(
    (line) => `${border("\u2502")} ${pad(fit(line, inner), inner)} ${border("\u2502")}`
  );
  const bottom = border(`\u2570${"\u2500".repeat(Math.max(0, w - 2))}\u256F`);
  return [top, ...body, bottom];
}
function kvLines(rows, inner) {
  if (rows.length === 0) {
    return [];
  }
  const keyW = Math.max(...rows.map(([key]) => width(key)));
  return rows.map(([key, value]) => {
    const keyPad = `${c.dim(pad(key, keyW))}  `;
    return `${keyPad}${fit(value, Math.max(8, inner - width(keyPad)))}`;
  });
}
function gauge(fraction, size, color = c.cyan) {
  const safeFraction = Math.max(0, Math.min(1, fraction));
  const filled = Math.round(safeFraction * size);
  return `${color("\u2588".repeat(filled))}${c.dim("\u2591".repeat(Math.max(0, size - filled)))}`;
}
function compactNumber(num) {
  if (!Number.isFinite(num) || num === 0) {
    return "0";
  }
  const abs = Math.abs(num);
  if (abs >= 1e9) {
    return `${(num / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
  }
  if (abs >= 1e6) {
    return `${(num / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (abs >= 1e3) {
    return `${(num / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return num.toLocaleString("en-US");
}
function formatUsd(dollars) {
  if (dollars === 0) {
    return "$0.00";
  }
  if (dollars < 0.01) {
    return `$${dollars.toFixed(4)}`;
  }
  return `$${dollars.toFixed(2)}`;
}
function formatAgo(timestampMs, now = Date.now()) {
  const diffSec = Math.max(0, Math.floor((now - timestampMs) / 1e3));
  if (diffSec < 60) {
    return `${diffSec}s ago`;
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) {
    return `${diffHr}h ago`;
  }
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

// src/ui/table.ts
function renderTable(rows, header, alignments) {
  const all = header ? [header, ...rows] : rows;
  if (all.length === 0) {
    return "";
  }
  const widths = [];
  for (const row of all) {
    for (const [i, cell] of row.entries()) {
      widths[i] = Math.max(widths[i] ?? 0, width(cell));
    }
  }
  const renderRow = (row, isHeader = false) => row.map((cell, i) => {
    const align = alignments?.[i] ?? "left";
    const w = widths[i] ?? 0;
    return align === "right" ? padLeft(cell, w) : pad(cell, w);
  }).join("  ").trimEnd();
  const lines = all.map((r, i) => renderRow(r, i === 0 && Boolean(header)));
  if (header) {
    lines[0] = c.bold(lines[0] ?? "");
    lines.splice(1, 0, c.dim(widths.map((w) => "\u2500".repeat(w)).join("  ")));
  }
  return lines.join("\n");
}

// src/ui/output.ts
var INDENT = "  ";
var MARK = {
  err: c.red("\u2717"),
  info: c.cyan("\u25CF"),
  ok: c.green("\u2713"),
  step: c.gold("\xB7"),
  warn: c.yellow("!")
};
var Ui = class {
  isJson;
  constructor(json = false) {
    this.isJson = json;
  }
  intro(title) {
    if (this.isJson) return;
    console.log(`
${INDENT}${BRAND} ${c.dim("\xB7")} ${c.bold(c.cyan(title))}`);
  }
  outro(message) {
    if (this.isJson) return;
    console.log(`${INDENT}${c.dim(message)}
`);
  }
  info(message) {
    if (this.isJson) return;
    for (const line of message.split("\n")) {
      console.log(`${INDENT}${MARK.info}  ${line}`);
    }
  }
  success(message) {
    if (this.isJson) return;
    for (const line of message.split("\n")) {
      console.log(`${INDENT}${MARK.ok}  ${line}`);
    }
  }
  warn(message) {
    if (this.isJson) return;
    for (const line of message.split("\n")) {
      console.log(`${INDENT}${MARK.warn}  ${line}`);
    }
  }
  error(message) {
    if (this.isJson) return;
    for (const line of message.split("\n")) {
      console.log(`${INDENT}${MARK.err}  ${line}`);
    }
  }
  line(text3 = "") {
    if (this.isJson) return;
    for (const l of text3.split("\n")) {
      console.log(l ? `${INDENT}${l}` : "");
    }
  }
  kv(rows, w = (process.stdout.columns ?? 80) - 4) {
    if (this.isJson) return;
    for (const l of kvLines(rows, w)) {
      console.log(`${INDENT}${l}`);
    }
  }
  table(rows, header) {
    if (this.isJson) return;
    const str = renderTable(rows, header);
    for (const l of str.split("\n")) {
      console.log(`${INDENT}${l}`);
    }
  }
  card(title, body, accent) {
    if (this.isJson) return;
    const w = Math.min(100, Math.max(40, (process.stdout.columns ?? 80) - 4));
    const inner = w - 4;
    const lines = body.split("\n").flatMap((l) => wrap2(l, inner));
    const b = box({ accent, title }, lines, w);
    for (const l of b) {
      console.log(`${INDENT}${l}`);
    }
  }
  json(data) {
    console.log(JSON.stringify(data, null, 2));
  }
};
var ui = new Ui();

// src/commands/export.ts
function registerExport(program3) {
  program3.command("export").description("Export recorded AI usage data to JSON or CSV").option("-f, --format <format>", "export format: json or csv", "json").option("-o, --out <file>", "write to file instead of stdout").action((options) => {
    const db = getDatabase();
    const events = db.getRecentEvents({ limit: 1e5 });
    let output = "";
    if (options.format.toLowerCase() === "csv") {
      const headers = [
        "eventId",
        "occurredAt",
        "harness",
        "model",
        "inputTokens",
        "outputTokens",
        "cacheReadTokens",
        "cacheWriteTokens",
        "totalTokens",
        "costUsd",
        "costSavingsUsd",
        "project"
      ];
      const rows = [headers.join(",")];
      for (const e of events) {
        rows.push([
          JSON.stringify(e.eventId),
          JSON.stringify(e.occurredAt),
          JSON.stringify(e.harness),
          JSON.stringify(e.model.name),
          e.tokens.input,
          e.tokens.output,
          e.tokens.cacheRead,
          e.tokens.cacheWrite,
          e.tokens.total,
          e.costUsd,
          e.costSavingsUsd,
          JSON.stringify(e.project?.name || "")
        ].join(","));
      }
      output = rows.join("\n");
    } else {
      output = JSON.stringify(events, null, 2);
    }
    if (options.out) {
      writeFileSync3(options.out, output, "utf8");
      ui.success(`Exported ${events.length} records to ${options.out}`);
    } else {
      process.stdout.write(output + "\n");
    }
  });
}

// src/ui/screen.ts
import readline from "node:readline";

// src/ui/banner.ts
var ROWS = 6;
var GLYPHS = {
  A: [" \u2588\u2588\u2588\u2588\u2588\u2557 ", "\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557", "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551", "\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551", "\u2588\u2588\u2551  \u2588\u2588\u2551", "\u255A\u2550\u255D  \u255A\u2550\u255D"],
  I: ["\u2588\u2588\u2557", "\u2588\u2588\u2551", "\u2588\u2588\u2551", "\u2588\u2588\u2551", "\u2588\u2588\u2551", "\u255A\u2550\u255D"],
  " ": ["   ", "   ", "   ", "   ", "   ", "   "],
  "-": ["      ", "      ", "\u2588\u2588\u2588\u2588\u2588\u2588", "\u255A\u2550\u2550\u2550\u2550\u2550\u255D", "      ", "      "],
  R: ["\u2588\u2588\u2588\u2588\u2588\u2588\u2557 ", "\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557", "\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D", "\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557", "\u2588\u2588\u2551  \u2588\u2588\u2551", "\u255A\u2550\u255D  \u255A\u2550\u255D"],
  E: ["\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557", "\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D", "\u2588\u2588\u2588\u2588\u2588\u2557  ", "\u2588\u2588\u2554\u2550\u2550\u255D  ", "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557", "\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D"],
  P: ["\u2588\u2588\u2588\u2588\u2588\u2588\u2557 ", "\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557", "\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D", "\u2588\u2588\u2554\u2550\u2550\u2550\u255D ", "\u2588\u2588\u2551     ", "\u255A\u2550\u255D     "],
  O: [" \u2588\u2588\u2588\u2588\u2588\u2588\u2557 ", "\u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557", "\u2588\u2588\u2551   \u2588\u2588\u2551", "\u2588\u2588\u2551   \u2588\u2588\u2551", "\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D", " \u255A\u2550\u2550\u2550\u2550\u2550\u255D "],
  T: ["\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557", "\u255A\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255D", "   \u2588\u2588\u2551   ", "   \u2588\u2588\u2551   ", "   \u2588\u2588\u2551   ", "   \u255A\u2550\u255D   "]
};
function wordmarkRows(word = "AI REPORTER") {
  const rows = [];
  for (let r = 0; r < ROWS; r++) {
    rows.push(
      [...word].map((ch) => {
        const glyph = GLYPHS[ch] ?? GLYPHS[" "];
        return glyph[r] ?? "";
      }).join("")
    );
  }
  return rows;
}
var WORDMARK_WIDTH = (wordmarkRows()[0] ?? "").length;
var CYAN_GOLD_GRADIENT = [
  [56, 189, 248],
  // Sky cyan
  [45, 212, 191],
  // Teal cyan
  [52, 211, 153],
  // Emerald
  [234, 182, 25],
  // Gold
  [245, 158, 11],
  // Amber
  [217, 107, 42]
  // Orange
];
function tint(text3, row) {
  if (!colorEnabled) {
    return text3;
  }
  const [r, g, b] = CYAN_GOLD_GRADIENT[Math.min(row, CYAN_GOLD_GRADIENT.length - 1)] ?? [
    255,
    255,
    255
  ];
  return `\x1B[38;2;${r};${g};${b}m${text3}\x1B[39m`;
}
function wordmarkLines(word = "AI REPORTER") {
  return wordmarkRows(word).map((row, i) => tint(row, i));
}
function banner(tagline = "24/7 AI Token & Spend Tracker \xB7 All Coding Agents", columns = process.stdout.columns ?? 80) {
  if (columns < WORDMARK_WIDTH + 2) {
    return `${BRAND} ${c.dim(`\xB7 ${tagline}`)}`;
  }
  return `${wordmarkLines().join("\n")}
${c.dim(tagline)}`;
}

// src/service/launchd.ts
import { execSync } from "node:child_process";
import { existsSync as existsSync18, unlinkSync as unlinkSync2, writeFileSync as writeFileSync4 } from "node:fs";
import { homedir as homedir14 } from "node:os";
import { dirname as dirname7, join as join17, resolve as resolve3 } from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";
var SERVICE_LABEL = "com.ai-reporter.daemon";
function plistPath() {
  return join17(homedir14(), "Library", "LaunchAgents", `${SERVICE_LABEL}.plist`);
}
function stdoutLogPath() {
  return join17(stateDir(), "daemon.log");
}
function stderrLogPath() {
  return join17(stateDir(), "daemon.err");
}
function generatePlist(nodePath, cliEntryPath) {
  const stdout = stdoutLogPath();
  const stderr = stderrLogPath();
  const currentPath = process.env.PATH || "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin";
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${SERVICE_LABEL}</string>
    <key>ProgramArguments</key>
    <array>
        <string>${nodePath}</string>
        <string>${cliEntryPath}</string>
        <string>daemon</string>
        <string>run</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${stdout}</string>
    <key>StandardErrorPath</key>
    <string>${stderr}</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>${currentPath}</string>
    </dict>
</dict>
</plist>
`;
}
function getCliEntry() {
  const currentFile = fileURLToPath2(import.meta.url);
  if (currentFile.endsWith("index.js") || currentFile.endsWith("ai-reporter.mjs")) {
    return currentFile;
  }
  const currentDir = dirname7(currentFile);
  const candidates = [
    resolve3(currentDir, "index.js"),
    resolve3(currentDir, "..", "index.js"),
    resolve3(currentDir, "..", "dist", "index.js"),
    resolve3(currentDir, "..", "..", "dist", "index.js"),
    resolve3(currentDir, "..", "bin", "ai-reporter.mjs"),
    resolve3(currentDir, "..", "..", "bin", "ai-reporter.mjs")
  ];
  for (const candidate of candidates) {
    if (existsSync18(candidate)) {
      return candidate;
    }
  }
  return currentFile;
}
var SYSTEMD_SERVICE_NAME = "ai-reporter.service";
function systemdServicePath() {
  return join17(homedir14(), ".config", "systemd", "user", SYSTEMD_SERVICE_NAME);
}
function serviceFilePath() {
  return process.platform === "darwin" ? plistPath() : systemdServicePath();
}
function generateSystemdService(nodePath, cliEntryPath) {
  const stdout = stdoutLogPath();
  const stderr = stderrLogPath();
  const currentPath = process.env.PATH || "/usr/local/bin:/usr/bin:/bin";
  return `[Unit]
Description=AI-Reporter 24/7 AI Token & Spend Tracker
After=network.target

[Service]
Type=simple
ExecStart=${nodePath} ${cliEntryPath} daemon run
Restart=always
RestartSec=5
StandardOutput=append:${stdout}
StandardError=append:${stderr}
Environment="PATH=${currentPath}"

[Install]
WantedBy=default.target
`;
}
function installService() {
  if (process.platform !== "darwin" && process.platform !== "linux") {
    throw new Error(`Background service installation is only supported on macOS and Linux (got ${process.platform}).`);
  }
  ensureDir(stateDir());
  const nodePath = process.execPath;
  const cliEntry = getCliEntry();
  if (process.platform === "darwin") {
    const file = plistPath();
    ensureDir(dirname7(file));
    const content = generatePlist(nodePath, cliEntry);
    writeFileSync4(file, content, { encoding: "utf8", mode: 420 });
    try {
      try {
        execSync(`launchctl unload "${file}" 2>/dev/null || true`);
      } catch {
      }
      execSync(`launchctl load "${file}"`);
      return {
        message: `24/7 background agent installed and started as ${SERVICE_LABEL}.`,
        plist: file,
        success: true
      };
    } catch (e) {
      return {
        message: `Failed to load launchd service: ${e.message}`,
        plist: file,
        success: false
      };
    }
  } else {
    const file = systemdServicePath();
    ensureDir(dirname7(file));
    const content = generateSystemdService(nodePath, cliEntry);
    writeFileSync4(file, content, { encoding: "utf8", mode: 420 });
    try {
      execSync("systemctl --user daemon-reload 2>/dev/null || true");
      execSync(`systemctl --user enable --now ${SYSTEMD_SERVICE_NAME}`);
      return {
        message: `24/7 background agent installed and started as ${SYSTEMD_SERVICE_NAME}.`,
        plist: file,
        success: true
      };
    } catch (e) {
      return {
        message: `Failed to enable systemd user service: ${e.message}`,
        plist: file,
        success: false
      };
    }
  }
}
function uninstallService() {
  if (process.platform !== "darwin" && process.platform !== "linux") {
    throw new Error(`Background service is only supported on macOS and Linux (got ${process.platform}).`);
  }
  const file = serviceFilePath();
  if (!existsSync18(file)) {
    return { message: "Service is not installed.", success: true };
  }
  if (process.platform === "darwin") {
    try {
      execSync(`launchctl unload "${file}" 2>/dev/null || true`);
    } catch {
    }
  } else {
    try {
      execSync(`systemctl --user disable --now ${SYSTEMD_SERVICE_NAME} 2>/dev/null || true`);
    } catch {
    }
  }
  try {
    unlinkSync2(file);
    if (process.platform === "linux") {
      try {
        execSync("systemctl --user daemon-reload 2>/dev/null || true");
      } catch {
      }
    }
    return { message: "Service successfully uninstalled.", success: true };
  } catch (e) {
    return { message: `Failed to remove service file: ${e.message}`, success: false };
  }
}
function getServiceStatus() {
  const file = serviceFilePath();
  const installed = existsSync18(file);
  const logPath = stdoutLogPath();
  const errPath = stderrLogPath();
  if (!installed) {
    return {
      errPath,
      installed: false,
      logPath,
      plistPath: file,
      running: false
    };
  }
  let running = false;
  let pid;
  if (process.platform === "darwin") {
    try {
      const output = execSync("launchctl list 2>/dev/null", { encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.includes(SERVICE_LABEL)) {
          const parts = line.trim().split(/\s+/);
          if (parts[0] && parts[0] !== "-") {
            pid = Number(parts[0]);
            running = Number.isFinite(pid) && pid > 0;
          } else {
            running = false;
          }
          break;
        }
      }
    } catch {
    }
  } else if (process.platform === "linux") {
    try {
      const statusOut = execSync(`systemctl --user is-active ${SYSTEMD_SERVICE_NAME} 2>/dev/null`, { encoding: "utf8" }).trim();
      running = statusOut === "active";
      if (running) {
        const pidOut = execSync(`systemctl --user show --property=MainPID ${SYSTEMD_SERVICE_NAME} 2>/dev/null`, { encoding: "utf8" }).trim();
        const m = pidOut.match(/MainPID=(\d+)/);
        if (m && m[1]) {
          pid = Number(m[1]);
        }
      }
    } catch {
    }
  }
  return {
    errPath,
    installed,
    logPath,
    pid,
    plistPath: file,
    running
  };
}
function startService() {
  const file = serviceFilePath();
  if (!existsSync18(file)) {
    throw new Error("Service is not installed. Run 'ai-reporter service install' first.");
  }
  if (process.platform === "darwin") {
    execSync(`launchctl start ${SERVICE_LABEL}`);
  } else if (process.platform === "linux") {
    execSync(`systemctl --user start ${SYSTEMD_SERVICE_NAME}`);
  }
}
function stopService() {
  const file = serviceFilePath();
  if (!existsSync18(file)) {
    throw new Error("Service is not installed.");
  }
  if (process.platform === "darwin") {
    execSync(`launchctl stop ${SERVICE_LABEL}`);
  } else if (process.platform === "linux") {
    execSync(`systemctl --user stop ${SYSTEMD_SERVICE_NAME}`);
  }
}

// src/ui/screen.ts
var HARNESS_INFO = {
  antigravity: { color: c.purple, glyph: "\u25E0", name: "Antigravity" },
  "claude-code": { color: c.orange, glyph: "\u273B", name: "Claude Code" },
  cursor: { color: c.cyan, glyph: "\u258D", name: "Cursor" },
  opencode: { color: c.green, glyph: "\u25C6", name: "OpenCode" },
  copilot: { color: c.blue, glyph: "\u25C9", name: "Copilot" },
  "gemini-cli": { color: c.gold, glyph: "\u2726", name: "Gemini CLI" },
  codex: { color: c.teal, glyph: "\u2B21", name: "Codex" },
  cline: { color: c.purple, glyph: "\u25A3", name: "Cline" },
  "kilo-code": { color: c.gold, glyph: "\u2B22", name: "Kilo Code" },
  pi: { color: c.orange, glyph: "\u03C0", name: "Pi" },
  omp: { color: c.purple, glyph: "\u03C0", name: "Oh My Pi" },
  "qwen-code": { color: c.blue, glyph: "\u274B", name: "Qwen Code" },
  devin: { color: c.cyan, glyph: "\u25C8", name: "Devin" }
};
function harnessLabel(id) {
  const info = HARNESS_INFO[id];
  if (!info) return id;
  return `${info.color(info.glyph)} ${info.name}`;
}
var Screen = class {
  watcher;
  options;
  timer;
  running = false;
  nextScanAt = Date.now() + 3e4;
  lastScanDurationMs = 0;
  newInLastScan = 0;
  statusMessage = "Initializing scanner...";
  lastRenderedLines = [];
  onExit;
  lastKnownTotalRequests = -1;
  isScanning = false;
  constructor(watcher, options = {}) {
    this.watcher = watcher;
    this.options = options;
    if (options.mode === "attached") {
      this.statusMessage = options.attachedPid ? `Live stream active (PID ${options.attachedPid})` : "Live stream active";
    }
  }
  isAttached() {
    return this.options.mode === "attached";
  }
  async triggerScan() {
    if (this.isScanning) return;
    this.isScanning = true;
    try {
      const res = await this.watcher.scanOnce();
      this.onScanResult(res.totalNew, res.durationMs);
    } catch (e) {
      this.statusMessage = `Scan failed: ${e.message || String(e)}`;
      this.render();
    } finally {
      this.isScanning = false;
    }
  }
  start() {
    if (this.running) return;
    this.running = true;
    process.stdout.write("\x1B[?1049h\x1B[?25l");
    process.stdout.on("resize", () => {
      this.render();
    });
    if (process.stdin.isTTY) {
      readline.emitKeypressEvents(process.stdin);
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on("keypress", async (_ch, key) => {
        if (!key) return;
        if (key.ctrl && key.name === "c") {
          this.stop();
          process.exit(0);
        } else if (key.name === "q") {
          this.stop();
        } else if (key.name === "p") {
          const paused = this.watcher.togglePause();
          this.statusMessage = paused ? "Watcher paused" : "Watcher resumed";
          this.render();
        } else if (key.name === "s") {
          if (this.isScanning) return;
          this.statusMessage = "Immediate scan triggered...";
          this.render();
          if (this.isAttached()) {
            await this.triggerScan();
          } else {
            this.watcher.wake();
          }
        } else if (key.name === "r") {
          this.render();
        }
      });
    }
    this.timer = setInterval(() => {
      this.render();
    }, 1e3);
    this.render();
  }
  onScanResult(totalNew, durationMs) {
    this.newInLastScan = totalNew;
    this.lastScanDurationMs = durationMs;
    this.nextScanAt = Date.now() + this.watcher.currentInterval();
    this.statusMessage = totalNew > 0 ? `Found ${totalNew} new usage event${totalNew === 1 ? "" : "s"} (${durationMs}ms)` : `Scan complete: up to date (${durationMs}ms)`;
    this.render();
  }
  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = void 0;
    }
    if (!this.isAttached()) {
      this.watcher.stop();
    }
    if (process.stdin.isTTY) {
      try {
        process.stdin.setRawMode(false);
      } catch {
      }
      process.stdin.pause();
    }
    process.stdout.write("\x1B[?25h\x1B[?1049l");
    this.onExit?.();
  }
  render() {
    if (!this.running) return;
    const cols = process.stdout.columns ?? 80;
    const rows = process.stdout.rows ?? 24;
    const lines = [];
    const now = Date.now();
    const db = getDatabase();
    const allSummary = db.getSummary();
    if (this.lastKnownTotalRequests >= 0 && allSummary.totalRequests > this.lastKnownTotalRequests) {
      const diff = allSummary.totalRequests - this.lastKnownTotalRequests;
      this.statusMessage = `Live: +${diff} new request${diff === 1 ? "" : "s"} recorded by 24/7 service`;
      this.nextScanAt = now + this.watcher.currentInterval();
    } else if (this.isAttached() && now >= this.nextScanAt) {
      this.nextScanAt = now + this.watcher.currentInterval();
    }
    this.lastKnownTotalRequests = allSummary.totalRequests;
    const bannerSubtitle = this.isAttached() ? "24/7 AI Token & Spend Tracker \xB7 Live Monitor" : "24/7 AI Token & Spend Tracker";
    lines.push(banner(bannerSubtitle, cols));
    lines.push("");
    const remainingMs = Math.max(0, this.nextScanAt - now);
    const intervalMs = this.watcher.currentInterval();
    const fraction = Math.min(1, Math.max(0, 1 - remainingMs / intervalMs));
    const countdownSec = Math.ceil(remainingMs / 1e3);
    const daemonStatus = getServiceStatus();
    const daemonTag = daemonStatus.running ? c.green(`\u25CF 24/7 Service active (pid ${daemonStatus.pid})`) : daemonStatus.installed ? c.yellow("\u25CB Service installed but stopped") : c.dim("\u25CB Service not installed (run 'ai-reporter service install')");
    const modeTag = this.isAttached() ? c.bold(c.cyan(" [LIVE STREAM]")) : "";
    const pausedTag = this.watcher.isPaused() ? c.yellow(" [PAUSED]") : "";
    const gaugeWidth = Math.max(10, Math.min(24, cols - 60));
    const scanLabel = this.isAttached() ? "Next sync in" : "Next scan in";
    const countdownLine = this.watcher.isPaused() ? `  ${c.yellow("\u23F8")}  ${c.bold("PAUSED")} \xB7 Press ${c.bold("p")} to resume` : `  ${gauge(fraction, gaugeWidth)}  ${scanLabel} ${c.bold(`${countdownSec}s`)} \xB7 ${c.dim(this.statusMessage)}`;
    lines.push(`${countdownLine}  \xB7  ${daemonTag}${modeTag}${pausedTag}`);
    lines.push("");
    const todayStr = new Date(now).toISOString().slice(0, 10);
    const todaySummary = db.getSummary({ since: `${todayStr}T00:00:00.000Z` });
    const summaryW = Math.min(cols - 4, 110);
    const todayLine = `${c.bold(compactNumber(todaySummary.totalTokens))} tokens  ${c.dim("(")}${compactNumber(todaySummary.inputTokens)} in \xB7 ${compactNumber(todaySummary.outputTokens)} out \xB7 ${c.dim(`${compactNumber(todaySummary.cacheReadTokens)} cached)`)}  \xB7  Cost: ${c.bold(c.gold(formatUsd(todaySummary.totalCostUsd)))}  \xB7  Saved by cache: ${c.green(formatUsd(todaySummary.totalCostSavingsUsd))}`;
    const allLine = `${c.bold(compactNumber(allSummary.totalTokens))} tokens  across ${c.bold(compactNumber(allSummary.totalRequests))} requests  \xB7  Total Cost: ${c.bold(c.gold(formatUsd(allSummary.totalCostUsd)))}  \xB7  All-time cache savings: ${c.green(formatUsd(allSummary.totalCostSavingsUsd))}`;
    const summaryBox = box(
      { accent: "cyan", title: "Usage & Spend Overview" },
      [
        `Today:    ${todayLine}`,
        `All-Time: ${allLine}`
      ],
      summaryW
    );
    for (const l of summaryBox) {
      lines.push(`  ${l}`);
    }
    lines.push("");
    const harnessSummaries = db.getHarnessSummaries();
    const harnessRows = [];
    for (const [id, info] of Object.entries(HARNESS_INFO)) {
      const found = harnessSummaries.find((h) => h.harness === id);
      const isLive = found?.lastEventAt && now - Date.parse(found.lastEventAt) < 5 * 60 * 1e3;
      const statusStr = isLive ? c.green("\u25CF live") : found?.lastEventAt ? c.dim("\u25CF idle") : c.dim("\u25CB no data");
      harnessRows.push([
        harnessLabel(id),
        statusStr,
        found ? compactNumber(found.requests) : c.dim("\u2013"),
        found ? compactNumber(found.tokens) : c.dim("\u2013"),
        found ? c.dim(compactNumber(found.cached)) : c.dim("\u2013"),
        found ? c.gold(formatUsd(found.costUsd)) : c.dim("\u2013"),
        found?.lastEventAt ? c.dim(formatAgo(Date.parse(found.lastEventAt), now)) : c.dim("\u2013")
      ]);
    }
    const harnessTableLines = renderTable(
      harnessRows,
      ["Harness", "Status", "Requests", "Tokens", "Cached", "Cost", "Last Active"],
      ["left", "left", "right", "right", "right", "right", "right"]
    ).split("\n");
    const harnessBox = box(
      { accent: "gold", title: "AI Coding Harnesses" },
      harnessTableLines,
      summaryW
    );
    for (const l of harnessBox) {
      lines.push(`  ${l}`);
    }
    lines.push("");
    const recent = db.getRecentEvents({ limit: 8 });
    if (recent.length > 0) {
      const reqRows = recent.map((r) => {
        const time = new Date(r.occurredAt).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });
        const hInfo = HARNESS_INFO[r.harness];
        const hGlyph = hInfo ? `${hInfo.color(hInfo.glyph)} ${r.harness}` : r.harness;
        return [
          c.dim(time),
          hGlyph,
          fit(r.model.name, 18),
          compactNumber(r.tokens.input),
          compactNumber(r.tokens.output),
          c.dim(compactNumber(r.tokens.cacheRead)),
          compactNumber(r.tokens.total),
          c.gold(formatUsd(r.costUsd)),
          r.project?.name ? fit(r.project.name, 16) : c.dim("\u2013")
        ];
      });
      const recentTableLines = renderTable(
        reqRows,
        ["Time", "Harness", "Model", "In", "Out", "Cached", "Total", "Cost", "Project"],
        ["left", "left", "left", "right", "right", "right", "right", "right", "left"]
      ).split("\n");
      const recentBox = box(
        { accent: "teal", title: "Recent Requests" },
        recentTableLines,
        summaryW
      );
      for (const l of recentBox) {
        lines.push(`  ${l}`);
      }
      lines.push("");
    }
    const footer = `  ${c.bold("q")} Quit  \xB7  ${c.bold("p")} Pause/Resume  \xB7  ${c.bold("s")} Scan Now  \xB7  ${c.bold("r")} Refresh  \xB7  ${c.dim("AI-Reporter running 24/7")}`;
    lines.push(footer);
    const screenBuffer = lines.slice(0, rows).join("\n");
    process.stdout.write(`\x1B[H\x1B[2J${screenBuffer}`);
  }
};

// src/commands/log.ts
function registerLog(program3) {
  program3.command("log").alias("history").description("View recent token usage requests and transactions").option("-n, --limit <count>", "number of requests to display", "25").option("--harness <name>", "filter by specific harness").option("--json", "output logs as JSON").action((options) => {
    const limit = Math.max(1, Number(options.limit) || 25);
    const db = getDatabase();
    const events = db.getRecentEvents({ harness: options.harness, limit });
    if (options.json) {
      ui.json(events);
      return;
    }
    ui.intro(`Recent Requests \xB7 Showing ${events.length} records`);
    if (events.length === 0) {
      ui.info("No usage events found yet. Run 'ai-reporter scan' to discover existing logs.");
      return;
    }
    const rows = events.map((e) => {
      const time = new Date(e.occurredAt).toLocaleString("en-GB", {
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
        second: "2-digit"
      });
      const info = HARNESS_INFO[e.harness];
      const harnessLabel2 = info ? `${info.color(info.glyph)} ${info.name}` : e.harness;
      return [
        c.dim(time),
        harnessLabel2,
        e.model.name,
        compactNumber(e.tokens.input),
        compactNumber(e.tokens.output),
        c.dim(compactNumber(e.tokens.cacheRead)),
        c.bold(compactNumber(e.tokens.total)),
        c.gold(formatUsd(e.costUsd)),
        e.project?.name || c.dim("\u2013")
      ];
    });
    ui.table(
      rows,
      ["Occurred", "Harness", "Model", "In", "Out", "Cached", "Total", "Cost", "Project"]
    );
    ui.line();
    ui.outro("Use 'ai-reporter log --limit 50' or 'ai-reporter stats' for aggregated totals.");
  });
}

// src/commands/pricing.ts
function registerPricing(program3) {
  const pricing = program3.command("pricing").description("View and configure token pricing per million tokens");
  pricing.command("list").description("List all model rates per 1M tokens").action(() => {
    ui.intro("AI-Reporter \xB7 Model Pricing Catalog");
    const catalog = loadPricing();
    const rows = Object.entries(catalog).map(([name, price]) => [
      name,
      `$${price.inputPer1M.toFixed(2)}`,
      `$${price.outputPer1M.toFixed(2)}`,
      `$${price.cacheReadPer1M.toFixed(2)}`,
      `$${price.cacheWritePer1M.toFixed(2)}`
    ]);
    ui.table(rows, ["Model", "Input / 1M", "Output / 1M", "Cache Read / 1M", "Cache Write / 1M"]);
    ui.line();
    ui.line("To override or add a price: 'ai-reporter pricing set <model> <input> <output> <cacheRead> <cacheWrite>'");
    ui.outro("");
  });
  pricing.command("set <model> <input> <output> [cacheRead] [cacheWrite]").description("Set custom price per 1M tokens for a model").action((model, inputStr, outputStr, cacheReadStr, cacheWriteStr) => {
    const input = Number(inputStr);
    const output = Number(outputStr);
    const cacheRead = cacheReadStr !== void 0 ? Number(cacheReadStr) : 0;
    const cacheWrite = cacheWriteStr !== void 0 ? Number(cacheWriteStr) : 0;
    if (!Number.isFinite(input) || !Number.isFinite(output)) {
      ui.error("Input and Output prices must be valid numbers.");
      return;
    }
    saveCustomPricing(model, {
      cacheReadPer1M: cacheRead,
      cacheWritePer1M: cacheWrite,
      inputPer1M: input,
      outputPer1M: output
    });
    ui.success(`Updated pricing for ${model}:`);
    ui.line(`  Input:       $${input}/1M`);
    ui.line(`  Output:      $${output}/1M`);
    ui.line(`  Cache Read:  $${cacheRead}/1M`);
    ui.line(`  Cache Write: $${cacheWrite}/1M`);
  });
}

// src/commands/scan.ts
function registerScan(program3) {
  program3.command("scan").alias("sync").description("Perform an immediate catchup scan of all local AI harnesses").option("-v, --verbose", "show verbose scan logs").action(async (options) => {
    ui.intro("AI-Reporter \xB7 Scan");
    ui.line(c.dim("Scanning Claude Code, Antigravity, Cursor, Copilot, OpenCode, Gemini CLI, etc..."));
    const watcher = new Watcher({
      verbose: options.verbose,
      onLog: (msg) => {
        if (options.verbose) {
          ui.line(c.dim(`  [log] ${msg}`));
        }
      }
    });
    const res = await watcher.scanOnce();
    ui.success(`Scan completed in ${res.durationMs}ms`);
    ui.line(`New usage records saved: ${c.bold(compactNumber(res.totalNew))}`);
    ui.line(`Total matching records observed: ${compactNumber(res.totalFound)}`);
    if (Object.keys(res.byHarness).length > 0) {
      ui.line(c.bold("Records by harness:"));
      for (const [h, count5] of Object.entries(res.byHarness)) {
        ui.line(`  \u2022 ${h}: ${compactNumber(count5)}`);
      }
    }
    if (res.failedHarnesses.length > 0) {
      ui.warn(`Warnings/failures encountered for: ${res.failedHarnesses.join(", ")}`);
    }
    ui.outro("All local databases and session logs are up to date.");
  });
}

// src/commands/service.ts
import { execSync as execSync2, spawn } from "node:child_process";
import { existsSync as existsSync19 } from "node:fs";
function registerService(program3) {
  const service = program3.command("service").description("Manage the 24/7 background agent on macOS (launchd) or Linux (systemd)");
  service.command("status").description("Check the background service status").action(() => {
    ui.intro("24/7 Background Service Status");
    const status = getServiceStatus();
    if (!status.installed) {
      ui.warn("Service is NOT installed.");
      ui.line("To run AI-Reporter 24/7 in the background across restarts, run:");
      ui.line(`  ${c.bold(c.cyan("ai-reporter service install"))}`);
      ui.outro("");
      return;
    }
    if (status.running) {
      ui.success(`Service is ACTIVE and RUNNING (PID: ${c.bold(String(status.pid))})`);
    } else {
      ui.warn("Service is INSTALLED but not currently running.");
    }
    ui.line();
    ui.kv([
      [process.platform === "darwin" ? "LaunchAgent Plist" : "systemd Service", status.plistPath],
      ["Log Output", status.logPath],
      ["Error Output", status.errPath]
    ]);
    ui.outro("");
  });
  service.command("install").description("Install and start the 24/7 background service").action(() => {
    ui.intro("Installing 24/7 Service");
    try {
      const res = installService();
      if (res.success) {
        ui.success(res.message);
        ui.line(c.dim(`Service file: ${res.plist}`));
        ui.line("AI-Reporter is now running 24/7 silently in the background.");
        ui.line("It will restart automatically on system reboot.");
      } else {
        ui.error(res.message);
      }
    } catch (e) {
      ui.error(`Installation failed: ${e.message}`);
    }
    ui.outro("");
  });
  service.command("uninstall").description("Stop and remove the 24/7 background service").action(() => {
    ui.intro("Uninstalling Service");
    try {
      const res = uninstallService();
      if (res.success) {
        ui.success(res.message);
      } else {
        ui.error(res.message);
      }
    } catch (e) {
      ui.error(`Uninstall failed: ${e.message}`);
    }
    ui.outro("");
  });
  service.command("start").description("Start the installed background service").action(() => {
    ui.intro("Starting Service");
    try {
      startService();
      ui.success("Service start signal sent.");
    } catch (e) {
      ui.error(`Start failed: ${e.message}`);
    }
    ui.outro("");
  });
  service.command("stop").description("Stop the running background service").action(() => {
    ui.intro("Stopping Service");
    try {
      stopService();
      ui.success("Service stopped.");
    } catch (e) {
      ui.error(`Stop failed: ${e.message}`);
    }
    ui.outro("");
  });
  service.command("logs").description("View recent 24/7 background service logs").option("-f, --follow", "follow log stream in real time").option("-n, --lines <number>", "number of lines to display", "25").action((opts) => {
    const log = stdoutLogPath();
    if (!existsSync19(log)) {
      ui.warn(`Log file not found at ${log}`);
      return;
    }
    const lines = Math.max(1, Number(opts.lines) || 25);
    if (opts.follow) {
      const proc = spawn("tail", ["-n", String(lines), "-f", log], { stdio: "inherit" });
      process.on("SIGINT", () => {
        proc.kill();
        process.exit(0);
      });
    } else {
      try {
        const out = execSync2(`tail -n ${lines} "${log}"`, { encoding: "utf8" });
        process.stdout.write(out);
      } catch (e) {
        ui.error(`Failed to read logs: ${e.message}`);
      }
    }
  });
  service.command("watch").alias("live").description("Launch the live interactive dashboard connected to the 24/7 service").action(async () => {
    await program3.parseAsync([process.argv[0], "ai-reporter", "watch"]);
  });
}

// src/commands/stats.ts
function registerStats(program3) {
  program3.command("stats").alias("summary").description("View token usage, spending, and model analytics").option("--today", "show usage for today only").option("--yesterday", "show usage for yesterday only").option("--week", "show usage for the last 7 days").option("--month", "show usage for the last 30 days").option("--all", "show all-time usage (default)").option("--json", "output stats as raw JSON").action((options) => {
    const db = getDatabase();
    const now = /* @__PURE__ */ new Date();
    let since;
    let until;
    let timeframeLabel = "All Time";
    if (options.today) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      since = d.toISOString();
      timeframeLabel = "Today";
    } else if (options.yesterday) {
      const start = new Date(now);
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      since = start.toISOString();
      until = end.toISOString();
      timeframeLabel = "Yesterday";
    } else if (options.week) {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      since = d.toISOString();
      timeframeLabel = "Last 7 Days";
    } else if (options.month) {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      since = d.toISOString();
      timeframeLabel = "Last 30 Days";
    }
    const summary = db.getSummary({ since, until });
    const harnesses = db.getHarnessSummaries({ since, until });
    const models = db.getModelSummaries({ since, until, limit: 10 });
    const projects = db.getProjectSummaries({ since, until, limit: 10 });
    const daily = db.getDailyUsage(14);
    if (options.json) {
      ui.json({
        daily,
        harnesses,
        models,
        projects,
        summary,
        timeframe: timeframeLabel
      });
      return;
    }
    ui.intro(`Usage & Spend Statistics \xB7 ${timeframeLabel}`);
    const overviewRows = [
      ["Total Tokens", `${c.bold(compactNumber(summary.totalTokens))} tokens`],
      ["Prompt Tokens (Input)", `${compactNumber(summary.inputTokens)} tokens`],
      ["Completion Tokens (Output)", `${compactNumber(summary.outputTokens)} tokens`],
      ["Cache Read Tokens", `${compactNumber(summary.cacheReadTokens)} tokens`],
      ["Cache Write Tokens", `${compactNumber(summary.cacheWriteTokens)} tokens`],
      ["Total Estimated Cost", c.bold(c.gold(formatUsd(summary.totalCostUsd)))],
      ["Saved by Prompt Caching", c.green(formatUsd(summary.totalCostSavingsUsd))],
      ["Total Requests Recorded", `${compactNumber(summary.totalRequests)} requests`],
      ["Active Sessions", `${compactNumber(summary.totalSessions)} sessions`]
    ];
    if (summary.firstEventAt) {
      overviewRows.push([
        "Date Range",
        `${new Date(summary.firstEventAt).toLocaleDateString()} \u2192 ${new Date(summary.lastEventAt || summary.firstEventAt).toLocaleDateString()}`
      ]);
    }
    ui.card("Overall Summary", overviewRows.map(([k, v]) => `${c.dim(k)}: ${v}`).join("\n"));
    ui.line();
    if (harnesses.length > 0) {
      ui.line(c.bold(c.cyan("\u2726 Breakdown by Harness:")));
      const hRows = harnesses.map((h) => {
        const info = HARNESS_INFO[h.harness];
        const label = info ? `${info.color(info.glyph)} ${info.name}` : h.harness;
        return [
          label,
          compactNumber(h.requests),
          compactNumber(h.tokens),
          compactNumber(h.input),
          compactNumber(h.output),
          c.dim(compactNumber(h.cached)),
          c.bold(c.gold(formatUsd(h.costUsd))),
          c.green(formatUsd(h.costSavingsUsd))
        ];
      });
      ui.table(
        hRows,
        ["Harness", "Requests", "Tokens", "In", "Out", "Cached", "Cost", "Savings"]
      );
      ui.line();
    }
    if (models.length > 0) {
      ui.line(c.bold(c.cyan("\u2726 Top Models:")));
      const mRows = models.map((m) => [
        m.modelName,
        c.dim(m.modelFamily),
        compactNumber(m.requests),
        compactNumber(m.tokens),
        compactNumber(m.input),
        compactNumber(m.output),
        c.dim(compactNumber(m.cached)),
        c.bold(c.gold(formatUsd(m.costUsd)))
      ]);
      ui.table(
        mRows,
        ["Model", "Family", "Requests", "Tokens", "In", "Out", "Cached", "Cost"]
      );
      ui.line();
    }
    if (projects.length > 0) {
      ui.line(c.bold(c.cyan("\u2726 Top Projects:")));
      const pRows = projects.map((p) => [
        p.projectName,
        compactNumber(p.requests),
        compactNumber(p.tokens),
        c.bold(c.gold(formatUsd(p.costUsd))),
        p.lastEventAt ? new Date(p.lastEventAt).toLocaleDateString() : "\u2013"
      ]);
      ui.table(pRows, ["Project", "Requests", "Tokens", "Cost", "Last Active"]);
      ui.line();
    }
    if (daily.length > 1) {
      ui.line(c.bold(c.cyan("\u2726 Daily Activity (Last 14 Days):")));
      const maxTokens = Math.max(...daily.map((d) => d.tokens), 1);
      for (const day of daily) {
        const barFraction = day.tokens / maxTokens;
        const bar = gauge(barFraction, 20, c.cyan);
        ui.line(
          `  ${c.dim(day.day)}  ${bar}  ${compactNumber(day.tokens).padStart(7)} tokens  ${c.gold(formatUsd(day.costUsd)).padStart(8)}  ${c.dim(`(${day.requests} reqs)`)}`
        );
      }
      ui.line();
    }
    ui.outro("Run 'ai-reporter watch' for a real-time live terminal monitor.");
  });
}

// src/commands/watch.ts
function registerWatch(program3) {
  program3.command("watch").description("Live interactive token dashboard and continuous file monitor").option("-i, --interval <seconds>", "seconds between scans", "30").option("--once", "scan once, print summary, and exit").option("--plain", "line-by-line output instead of full-terminal TUI").option("-v, --verbose", "log details of every scan").action(async (options) => {
    const intervalSec = Math.max(5, Number(options.interval) || 30);
    const intervalMs = intervalSec * 1e3;
    const isPlain = Boolean(options.plain || options.once || !process.stdout.isTTY);
    const lockResult = tryAcquireLock();
    const watcher = new Watcher({
      intervalMs,
      verbose: options.verbose,
      onLog: (msg) => {
        if (options.verbose || isPlain) {
          ui.line(c.dim(`[log] ${msg}`));
        }
      }
    });
    if (options.once) {
      try {
        ui.intro("AI-Reporter \xB7 One-off Scan");
        ui.line(c.dim("Scanning local AI coding harness sessions..."));
        const result = await watcher.scanOnce();
        ui.success(`Scan completed in ${result.durationMs}ms`);
        ui.line(`New events recorded: ${c.bold(compactNumber(result.totalNew))}`);
        for (const [harness, count5] of Object.entries(result.byHarness)) {
          ui.line(`  \u2022 ${harness}: ${compactNumber(count5)} events`);
        }
        if (result.failedHarnesses.length > 0) {
          ui.warn(`Warnings/failures in: ${result.failedHarnesses.join(", ")}`);
        }
        ui.outro("Done. Database updated.");
      } finally {
        if (lockResult.acquired) {
          lockResult.release();
        }
      }
      return;
    }
    if (isPlain) {
      if (!lockResult.acquired) {
        ui.intro("AI-Reporter \xB7 Plain Watch Mode");
        ui.line(
          c.dim(
            `Connected to 24/7 Service (PID ${lockResult.pid}) \xB7 Monitoring live updates \xB7 Press Ctrl+C to stop`
          )
        );
        let lastCount = -1;
        const pollInterval = Math.max(2, Math.min(intervalSec, 10)) * 1e3;
        const db = getDatabase();
        const poll = () => {
          const summary = db.getSummary();
          if (lastCount >= 0 && summary.totalRequests > lastCount) {
            const diff = summary.totalRequests - lastCount;
            const time = (/* @__PURE__ */ new Date()).toLocaleTimeString();
            ui.line(
              `[${time}] +${c.bold(compactNumber(diff))} new events recorded by 24/7 service \xB7 Total: ${compactNumber(summary.totalTokens)} tokens (${c.gold(formatUsd(summary.totalCostUsd))})`
            );
          }
          lastCount = summary.totalRequests;
        };
        poll();
        const timer = setInterval(poll, pollInterval);
        const handleSigint2 = () => {
          clearInterval(timer);
          ui.outro("Stopped.");
          process.exit(0);
        };
        process.on("SIGINT", handleSigint2);
        process.on("SIGTERM", handleSigint2);
        await new Promise(() => {
        });
        return;
      }
      try {
        ui.intro("AI-Reporter \xB7 Plain Watch Mode");
        ui.line(c.dim(`Scanning every ${intervalSec}s \xB7 Press Ctrl+C to stop`));
        watcher["onScanComplete"] = (res) => {
          const time = (/* @__PURE__ */ new Date()).toLocaleTimeString();
          ui.line(
            `[${time}] Scan finished in ${res.durationMs}ms \xB7 ${c.bold(compactNumber(res.totalNew))} new events`
          );
        };
        const handleSigint2 = () => {
          watcher.stop();
          lockResult.release();
          ui.outro("Stopped.");
          process.exit(0);
        };
        process.on("SIGINT", handleSigint2);
        process.on("SIGTERM", handleSigint2);
        await watcher.run();
      } finally {
        lockResult.release();
      }
      return;
    }
    if (!lockResult.acquired) {
      const screen2 = new Screen(watcher, {
        attachedPid: lockResult.pid,
        mode: "attached"
      });
      const handleSigint2 = () => {
        screen2.stop();
        process.exit(0);
      };
      process.on("SIGINT", handleSigint2);
      process.on("SIGTERM", handleSigint2);
      await new Promise((resolve4) => {
        screen2.onExit = () => resolve4();
        screen2.start();
      });
      return;
    }
    const screen = new Screen(watcher, { mode: "standalone" });
    watcher["onScanComplete"] = (res) => {
      screen.onScanResult(res.totalNew, res.durationMs);
    };
    const handleSigint = () => {
      screen.stop();
      lockResult.release();
      process.exit(0);
    };
    process.on("SIGINT", handleSigint);
    process.on("SIGTERM", handleSigint);
    try {
      screen.onExit = () => watcher.stop();
      screen.start();
      await watcher.run();
    } finally {
      screen.stop();
      lockResult.release();
    }
  });
}

// src/version.ts
var VERSION = "1.0.0";

// src/index.ts
process.stdout.on("error", (err) => {
  if (err?.code === "EPIPE") {
    process.exit(0);
  }
});
var program2 = new Command();
program2.name("ai-reporter").description("Track all AI tokens and spend 24/7 across Claude Code, Antigravity, Cursor, Copilot and more").version(VERSION);
registerWatch(program2);
registerStats(program2);
registerScan(program2);
registerLog(program2);
registerService(program2);
registerDaemon(program2);
registerPricing(program2);
registerExport(program2);
registerCursorHook(program2);
program2.action(() => {
  const db = getDatabase();
  const summary = db.getSummary();
  const service = getServiceStatus();
  console.log(banner());
  console.log();
  ui.card(
    "Live Summary",
    [
      `Total Tokens Tracked:  ${c.bold(compactNumber(summary.totalTokens))} tokens across ${compactNumber(summary.totalRequests)} requests`,
      `Total Estimated Spend: ${c.bold(c.gold(formatUsd(summary.totalCostUsd)))} (Saved ${c.green(formatUsd(summary.totalCostSavingsUsd))} with prompt cache)`,
      `24/7 Background Agent: ${service.running ? c.green(`Active (PID: ${service.pid})`) : service.installed ? c.yellow("Installed (Stopped)") : c.dim("Not installed")}`
    ].join("\n"),
    "cyan"
  );
  console.log();
  ui.line(c.bold("Commands:"));
  ui.line(`  ${c.bold(c.cyan("ai-reporter watch"))}              Live full-terminal dashboard & file watcher`);
  ui.line(`  ${c.bold(c.cyan("ai-reporter stats"))}              Detailed spend & model analytics (--today, --week, etc.)`);
  ui.line(`  ${c.bold(c.cyan("ai-reporter scan"))}               Scan and catch up all local session files now`);
  ui.line(`  ${c.bold(c.cyan("ai-reporter log"))}                View recent requests stream`);
  ui.line(`  ${c.bold(c.cyan("ai-reporter service install"))}    Run 24/7 in the background on macOS (launchd)`);
  ui.line(`  ${c.bold(c.cyan("ai-reporter pricing list"))}       View or customize model token pricing`);
  ui.line(`  ${c.bold(c.cyan("ai-reporter export"))}             Export data to JSON or CSV`);
  console.log();
});
program2.parse(process.argv);
