# frozen_string_literal: true
require 'fastlane'
# require 'json'


def config_item_to_hash(config_item)
  {
    key: config_item.key,
    env_name: config_item.env_name,
    description: config_item.description,
    default_value: config_item.default_value,
    optional: config_item.optional,
    is_string: config_item.is_string,
    data_type: config_item.data_type
  }
end

def generate_file_paths_list
  Fastlane::Actions.load_default_actions.map do |file_path|
    action_name = File.basename(file_path, '.rb')
    { 'action_name' => action_name, 'file_path' => file_path }
  end
end

# def write_to_json_file(file_path, data)
#   File.open(file_path, 'w') { |f| f.write(JSON.pretty_generate(data)) }
# end

file_paths_list = generate_file_paths_list

# write_to_json_file('./file_path.json', file_paths_list)


list = Fastlane::Actions.get_all_official_actions
valid_action_number = 0
invalid_action_number = 0
completion_list = []
list.each do |element|
  action_name = element.to_s
  instance = Fastlane::Actions.action_class_ref(element)
  if instance
    # puts "INSTANCE #{action_name}"
    valid_action_number += 1
    begin

      options_check = instance.method('available_options')
      if !options_check.call.nil? && !options_check.call.empty?
        hash_list = options_check.call.map do |config_item|
          if config_item.is_a?(FastlaneCore::ConfigItem)
            config_item_to_hash(config_item)
          else
            #puts "ACTION #{action_name} HAS INVALID CONFIG ITEM: #{config_item}"
            if config_item.is_a?(Array) && config_item.length == 2
              {
                key: config_item[0],
                env_name: nil,
                description: config_item[1],
                default_value: nil,
                optional: nil,
                is_string: nil,
                data_type: nil
              }
            end
          end
        end
        completion_list.append({ 'action_name' => action_name, 'args' => hash_list })
      else
        #puts "INVALID INSTANCE: #{action_name}"
        completion_list.append({ 'action_name' => action_name, 'args' => nil })
      end
    rescue NameError => e
      invalid_action_number += 1
      #puts "Skipping #{instance.to_s} due to an issue with uninitialized constants: #{e.message}"
      completion_list.append({ 'action_name' => action_name, 'args' => nil })
    end
  else
    invalid_action_number += 1
    #puts "NOT AN INSTANCE #{action_name}"
  end
end

# puts "TOTAL ACTIONS: #{list.length}"
#puts "VALID INSTANCES: #{valid_action_number}"
#puts "INVALID INSTANCES: #{invalid_action_number}"


# write_to_json_file('./temp.json', completion_list)

# Create a hash to store merged elements
merged_hash = {}

# Add all elements from list_1 to the merged_hash
file_paths_list.each do |element|
  action_name = element["action_name"]
  merged_hash[action_name] = element
end

# Merge elements from list_2 into the merged_hash
completion_list.each do |element|
  action_name = element["action_name"]
  if merged_hash.key?(action_name)
    merged_hash[action_name] = merged_hash[action_name].merge(element)
  else
  end
end


merged_hash.delete_if { |action_name, _| !completion_list.any? { |el| el["action_name"] == action_name } }

# Convert the merged_hash back into an array
merged_list = merged_hash.values

# write_to_json_file('./merged.json', merged_list)

puts "#{merged_list}"