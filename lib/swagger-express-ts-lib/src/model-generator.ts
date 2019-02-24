import { SwaggerService } from "./swagger.service";
import { IApiOperationArgsBase } from "./i-api-operation-args.base";
const fs = require("fs");
const findInFiles = require("find-in-files")

let models = SwaggerService.getInstance().getData().definitions

export async function addModel(args: IApiOperationArgsBase) {
  models = SwaggerService.getInstance().getData().definitions

  const successfulResponseModelName = args && args.responses && args.responses[200] && args.responses[200].model;
  const bodyModelName = args && args.parameters && args.parameters.body && args.parameters.body.model;

  if(successfulResponseModelName) {
    await generateModelWithChildModels(successfulResponseModelName)
  }

  if(bodyModelName) {
    await generateModelWithChildModels(bodyModelName)
  }

  SwaggerService.getInstance().setDefinitions(models)
}

async function generateModelWithChildModels(modelName: any) {
	const interfaceProperties = await getInterfaceProperties(modelName)
	await interfaceToModel(modelName, interfaceProperties)
}

async function getInterfaceProperties(interfaceName: string) {
	let path = await findFileInterface(interfaceName)
	return path ? await getPropertiesFromFile(path, interfaceName) : []
}

async function findFileInterface(interfaceName: string) {
	const searchString = `export interface ${interfaceName} `
	const pathsToSearchForModels = [
		'src',
		'../shared/src',
		'../../node_modules/@hero',
		'node_modules/hero-common-gw/dist',
		'../shared/node_modules/hero-common-gw/dist'
	]

	for (const path of pathsToSearchForModels) {
		let files = await findInFiles.find(searchString, path, '.ts$')
		let file = Object.keys(files)[0]

		if (file) {
			return file
		}
	}
}

async function getPropertiesFromFile(path: string, interfaceName: string) {
	const replace = `export interface ${interfaceName} [^]*}`;
	const regex = new RegExp(replace, "g");
	const file = fs.readFileSync(path, "utf8")

	const interfaceObj = file.match(regex)[0].split("}")[0]
	let interfaceProperties = interfaceObj.split("\n")
	const header = interfaceProperties.shift()

	interfaceProperties = interfaceProperties.map((property: any) => property.replace("\t", ""))
	interfaceProperties = interfaceProperties.filter((property: any) => property)

	const extendsOtherInterface = header.includes("extends")

	if (extendsOtherInterface) {
		const parentInterface = header.split("extends")[1].split("{")[0].trim()
		const parentProperties = await getInterfaceProperties(parentInterface)
		interfaceProperties = interfaceProperties.concat(parentProperties)
	}

	return interfaceProperties
}

async function interfaceToModel(interfaceName: string, interfaceProperties: any) {
	models[interfaceName] = { properties: {}, type: "" }
	for (const property of interfaceProperties) {
		await interfacePropertyToModelProperty(interfaceName, property)
	}
	return
}

async function interfacePropertyToModelProperty(interfaceName: string, interfaceProperty: any) {
	interfaceProperty = interfaceProperty.replace(";", "")
	const propertyLeftSide = interfaceProperty.split(":")[0]
	const propertyRightSide = interfaceProperty.split(":")[1].trim()

	const propertyName = propertyLeftSide.replace("?", "")
	const isOptional = propertyLeftSide.indexOf("?") >= 0
	const propertyType = propertyRightSide.replace("[]", "")
	const isArray = propertyRightSide.indexOf("[]") >= 0

	const model:any = {
		description: propertyName,
		required: !isOptional,
		type: propertyType
	}

	const isPrimitive = isPropertyPrimitive(model)

	if (!isPrimitive) {
		if (!models[model.type]) {
			const properties = await getInterfaceProperties(model.type)
			await interfaceToModel(model.type, properties)
		}
		model.model = model.type
		model.type = "object"
	} else {
		if (model.type == "Date") {
			model.type = "string"
			model.format = "date"
		}
	}

	if (isArray) {
		model.itemType = model.type
		model.type = "array"
	}

	models[interfaceName].properties[model.description] = model
	return model
}

function isPropertyPrimitive(modelPropery: any) {
	const primitives = ["string", "integer", "number", "boolean", "Date"]
	return primitives.includes(modelPropery.type)
}
