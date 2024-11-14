/* eslint-disable */

export const AllTypesProps: Record<string,any> = {
	DateTime: `scalar.DateTime` as const,
	ExtensionInput:{
		config:"JSON",
		created_at:"DateTime",
		updated_at:"DateTime"
	},
	GetExtensionsInput:{

	},
	JSON: `scalar.JSON` as const,
	Mutation:{
		installExtension:{
			data:"ExtensionInput"
		},
		uninstallExtension:{
			data:"UninstallExtensionInput"
		},
		updateExtension:{
			data:"ExtensionInput"
		}
	},
	Query:{
		getExtensions:{
			data:"GetExtensionsInput"
		}
	},
	UninstallExtensionInput:{

	}
}

export const ReturnTypes: Record<string,any> = {
	DateTime: `scalar.DateTime` as const,
	Extension:{
		available:"Boolean",
		config:"JSON",
		created_at:"DateTime",
		description:"String",
		enabled:"Boolean",
		image:"String",
		installed:"Boolean",
		instructions:"String",
		name:"String",
		readme:"String",
		schema:"JSON",
		tags:"String",
		title:"String",
		updated_at:"DateTime"
	},
	JSON: `scalar.JSON` as const,
	Mutation:{
		installExtension:"Extension",
		uninstallExtension:"Boolean",
		updateExtension:"Extension"
	},
	Query:{
		getExtensions:"Extension"
	}
}

export const Ops = {
query: "Query" as const,
	mutation: "Mutation" as const
}