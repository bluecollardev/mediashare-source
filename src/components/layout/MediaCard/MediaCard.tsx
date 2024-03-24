import React, { useState, useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { Card, Paragraph } from 'react-native-paper';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import { TextInput } from 'react-native-paper';
import { MultiSelectIcon } from 'mediashare/components/form';
import { DisplayPreviewOrVideo } from './DisplayPreviewOrVideo';
import { MediaCardTitle } from './MediaCardTitle';
import { MediaCardTags } from './MediaCardTags';
import { mappedKeysToTags } from 'mediashare/core/utils/tags';
import { titleValidator, descriptionValidator } from 'mediashare/core/utils/validators';
import { theme, components } from 'mediashare/styles';

import { AuthorProfile } from 'mediashare/models/AuthorProfile';

export interface MediaCardProps {
  id?: string;
  title?: string;
  authorProfile?: AuthorProfile;
  description?: string;
  sortIndex?: string;
  showSocial?: any | boolean;
  showActions?: boolean;
  showDescription?: boolean;
  showAvatar?: boolean;
  showImage?: boolean;
  image?: string;
  imageStyle?: any;
  mediaSrc?: string | null;
  visibility?: string;
  // TODO: Fix Tag type
  // availableTags?: Tag[];
  availableTags?: any[];
  tags?: any[];
  children?: any;
  topDrawer?: React.FC<any>;
  isEdit?: boolean;
  isPlayable?: boolean;
  isReadOnly?: boolean;
  onActionsClicked?: () => void;
  onTitleChange?: (value: string) => void;
  onDescriptionChange?: (value: string) => void;
  onSortIndexChange?: (value: string) => void;
  onTagChange?: (value: string) => void;
  tagOptions?: any[];
  onVisibilityChange?: (value: string) => void;
  visibilityOptions?: any[];
  likes?: number;
  views?: number;
  shares?: number;
  elevation?: number;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  title = '',
  authorProfile = {} as AuthorProfile,
  description = '',
  sortIndex = undefined as string,
  mediaSrc,
  showSocial = false,
  showActions = false,
  showDescription = true,
  showAvatar = false,
  showImage = true,
  image = null,
  imageStyle,
  onActionsClicked = () => {},
  children,
  topDrawer = undefined,
  visibility = 'private',
  // TODO: Fix Tag type
  // availableTags = [] as Tag[],
  availableTags = [] as any[],
  tags = [],
  isEdit = false,
  isPlayable = false,
  isReadOnly = false,
  elevation = 0,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onTitleChange = (value: string) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDescriptionChange = (value: string) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSortIndexChange = (value: string) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onVisibilityChange = (value: string) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onTagChange = (value: string) => {},
  tagOptions = [],
  likes = 0,
  views = 0,
  shares = 0,
}: MediaCardProps) => {
  // TODO: Finish default to private!
  const [selectedVisibility, setSelectedVisibility] = useState([visibility || 'private']);
  const onSelectedVisibilityChange = (visibility) => {
    setSelectedVisibility(visibility);
    onVisibilityChange(visibility);
  };

  const mappedSelectedTags = useMemo(() => mappedKeysToTags(tags, availableTags), []);
  const mappedSelectedTagKeys = useMemo(() => {
    return mappedSelectedTags.map(({ key }) => key);
  }, []);
  const [selectedTagKeys, setSelectedTagKeys] = useState(mappedSelectedTagKeys);
  const onSelectedTagsChange = (newTags) => {
    setSelectedTagKeys(newTags);
    onTagChange(newTags);
  };

  const TopDrawer = topDrawer;

  const showMediaPreview = showImage && (!!image || !!mediaSrc);
  
  // TODO: Use consts or something instead of strings!
  const visibilityOptions = [
    { key: 'private', value: `Private` },
    { key: 'shared', value: `Visible to Contacts` },
    { key: 'subscription', value: `Visible to Subscribers` },
    { key: 'public', value: `Visible to Public` },
  ];
  
  const { width, height, scale } = useWindowDimensions();
  const isPortrait = height > width;
  
  return isEdit ? (
    <>
      {isPortrait ? (
        <View>
          <View style={defaultStyles.container}>
            {showMediaPreview ? (
              <DisplayPreviewOrVideo
                key={mediaSrc}
                mediaSrc={mediaSrc}
                isPlayable={isPlayable}
                showImage={showImage}
                image={image}
                style={imageStyle}
              />
            ) : null}
            {topDrawer ? <TopDrawer /> : null}
            {renderForm(true)}
          </View>
        </View>
      ) : (
        <View style={{ display: 'flex', flexDirection: 'row' }}>
          <View style={defaultStyles.containerTwoThirds}>
            {renderForm()}
          </View>
          <View style={defaultStyles.containerThird}>
            <Card style={defaultStyles.card} elevation={elevation as any}>
              {showMediaPreview ? (
                <DisplayPreviewOrVideo
                  key={mediaSrc}
                  mediaSrc={mediaSrc}
                  isPlayable={isPlayable}
                  showImage={showImage}
                  image={image}
                  style={imageStyle}
                />
              ) : null}
              {topDrawer ? <TopDrawer /> : null}
              <View style={{ marginTop: 15 }}>{children}</View>
            </Card>
          </View>
        </View>
      )}
    </>
  ) : (
    <>
      {isPortrait ? renderCard(true) : (
        <View style={{ display: 'flex', flexDirection: 'row' }}>
          <View style={defaultStyles.containerTwoThirds}>
            {renderCard()}
          </View>
          <View style={defaultStyles.containerThird}>
            <Card style={defaultStyles.card} elevation={elevation as any}>
              <Card.Content style={{ paddingTop: 0, marginTop: 0, marginBottom: 25 }}>
                {children}
              </Card.Content>
            </Card>
          </View>
        </View>
      )}
    </>
  );
  
  function renderCard(renderChildren: boolean = false) {
    // @ts-ignore
    return (
      <Card style={defaultStyles.card} elevation={elevation as any}>
        {showMediaPreview ? (
          <DisplayPreviewOrVideo
            key={mediaSrc}
            mediaSrc={mediaSrc}
            isPlayable={isPlayable}
            showImage={showImage}
            image={image}
            style={imageStyle}
          />
        ) : null}
        {/* Had to use actual text spaces to space this out for some reason not going to look into it now... */}
        <MediaCardTitle
          title={title}
          authorProfile={authorProfile}
          visibility={visibility}
          showImage={showAvatar}
          showActions={showActions}
          showSocial={showSocial}
          likes={likes}
          shares={shares}
          views={views}
          onActionsClicked={onActionsClicked}
          style={!showMediaPreview ? { marginTop: 0, marginBottom: 5 } : { marginBottom: 5 }}
        />
        <Card.Content style={{ marginBottom: 15, marginTop: 0, paddingTop: 0 }}>
          <MediaCardTags tags={mappedSelectedTags} />
        </Card.Content>
        <Card.Content style={{ marginTop: 0, marginBottom: 25 }}>
          {renderChildren ? children : null}
          {showDescription ? (
            <Paragraph style={defaultStyles.description}>{description}</Paragraph>
          ) : null}
        </Card.Content>
      </Card>
    );
  }
  
  function renderForm(renderChildren: boolean = false) {
    return (
      <>
        <View style={{ ...defaultStyles.formField, marginTop: isPortrait ? 25 : 0 }}>
          <TextInput
            label="Title"
            value={title}
            multiline={true}
            error={title && titleValidator(title)}
            onChangeText={(text) => onTitleChange(text)}
            disabled={isReadOnly}
          />
        </View>
        {sortIndex !== undefined ? (
          <View style={{ ...defaultStyles.formField }}>
            <TextInput
              keyboardType="numeric"
              style={{ backgroundColor: theme.colors.surface, fontSize: 15 }}
              multiline={true}
              label="Sort Index"
              value={sortIndex}
              numberOfLines={1}
              onChangeText={(textValue) => onSortIndexChange(textValue.replace(/[^0-9]/g, ''))}
              disabled={isReadOnly}
            />
          </View>
        ) : null}
        <View style={{ ...defaultStyles.formField }}>
          <SectionedMultiSelect
            colors={components.multiSelect.colors}
            styles={components.multiSelect.styles}
            items={availableTags}
            IconRenderer={MultiSelectIcon as any}
            uniqueKey="key"
            displayKey="value"
            subKey="children"
            searchPlaceholderText="Enter Text"
            selectText="Select Tags"
            confirmText="Done"
            onSelectedItemsChange={onSelectedTagsChange}
            selectedItems={selectedTagKeys}
            expandDropDowns={false}
            readOnlyHeadings={false}
            showDropDowns={true}
            parentChipsRemoveChildren={true}
            showCancelButton={true}
            modalWithTouchable={false}
            modalWithSafeAreaView={true}
          />
          <SectionedMultiSelect
            colors={components.multiSelect.colors}
            styles={components.multiSelect.styles}
            items={visibilityOptions}
            IconRenderer={MultiSelectIcon as any}
            uniqueKey="key"
            displayKey="value"
            subKey="children"
            searchPlaceholderText="Enter Text"
            selectText="Share With"
            confirmText="Done"
            onSelectedItemsChange={onSelectedVisibilityChange}
            selectedItems={selectedVisibility}
            single={true}
            hideSearch={true}
            expandDropDowns={false}
            readOnlyHeadings={false}
            showDropDowns={false}
            showChips={false}
            parentChipsRemoveChildren={false}
            showCancelButton={true}
            modalWithTouchable={false}
            modalWithSafeAreaView={true}
          />
        </View>
        {renderChildren ? <View>{children}</View> : null}
        {/* Description can be the longest field so we've moved it to last when we're in edit mode */}
        <View style={{ ...defaultStyles.formField, marginTop: renderChildren ? 25 : 10 }}>
          <TextInput
            style={{ ...defaultStyles.descriptionField, ...(Platform.OS !== 'web' ? { overflow: 'scroll' } : {}) }}
            multiline={true}
            label="Description"
            value={description}
            numberOfLines={10}
            error={title && descriptionValidator(description)}
            onChangeText={(text) => onDescriptionChange(text)}
            disabled={isReadOnly}
          />
        </View>
      </>
    );
  }
};

const defaultStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
  },
  containerTwoThirds: {
    paddingHorizontal: 10,
    width: '66.666%',
    flex: 3,
  },
  containerThird: {
    paddingHorizontal: 10,
    width: '33.333%',
    flex: 2,
  },
  card: {
    margin: 0,
  },
  description: {
    marginBottom: 15,
    fontSize: 13,
    color: theme.colors.text,
    fontFamily: theme.fonts.thin.fontFamily,
  },
  formField: {
    marginBottom: 5,
  },
  descriptionField: {
    height: 500,
    backgroundColor: theme.colors.surface,
    fontSize: 15,
    paddingTop: 0,
    paddingHorizontal: 16,
  },
});
